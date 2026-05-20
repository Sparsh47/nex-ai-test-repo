package main

import (
    "crypto/rand"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "github.com/Sparsh47/nex-ai-test-repo/store"
)

// generateUUID creates a random UUID string using crypto/rand.
func generateUUID() (string, error) {
    // UUID version 4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where y is one of 8, 9, a, b.
    b := make([]byte, 16)
    _, err := rand.Read(b)
    if err != nil {
        return "", err
    }
    // Set version (4) and variant (2 bits) per RFC 4122.
    b[6] = (b[6] & 0x0f) | 0x40 // Version 4
    b[8] = (b[8] & 0x3f) | 0x80 // Variant is 10
    uuid := fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
        b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
    return uuid, nil
}

func main() {
    // Using Go 1.22+ standard library routing
    mux := http.NewServeMux()

    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // Register product routes
    mux.HandleFunc("POST /products", handleCreateProduct)
    mux.HandleFunc("GET /products", handleListProducts)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}

// handleCreateProduct processes POST /products requests.
func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    var p store.Product
    if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
        return
    }
    // Validation
    if p.Name == "" || p.Price <= 0 {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"error": "invalid product data"})
        return
    }
    // Generate ID
    id, err := generateUUID()
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate ID"})
        return
    }
    p.ID = id
    // Store safely
    store.Mu.Lock()
    store.Products[p.ID] = p
    store.Mu.Unlock()

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(p)
}

// handleListProducts processes GET /products requests.
func handleListProducts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, p := range store.Products {
        products = append(products, p)
    }
    store.Mu.RUnlock()

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(products)
}
