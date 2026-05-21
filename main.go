package main

import (
    "encoding/json"
    "log"
    "net/http"

    "github.com/google/uuid"
    "github.com/Sparsh47/nex-ai-test-repo/store"
)

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
    // Generate ID using google/uuid
    p.ID = uuid.NewString()

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
