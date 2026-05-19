package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "log"
    "net/http"
    "github.com/Sparsh47/nex-ai-test-repo/store"
)

// generateID creates a random 16-byte hex string ID.
func generateID() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return hex.EncodeToString(b), nil
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
}

func postProductHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    defer r.Body.Close()
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
    // Generate ID and store
    id, err := generateID()
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate ID"})
        return
    }
    p.ID = id
    store.Mu.Lock()
    store.Products[p.ID] = p
    store.Mu.Unlock()
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(p)
}

func getProductsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, prod := range store.Products {
        products = append(products, prod)
    }
    store.Mu.RUnlock()
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(products)
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodPost:
        postProductHandler(w, r)
    case http.MethodGet:
        getProductsHandler(w, r)
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
    }
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", healthHandler)
    mux.HandleFunc("/products", productsHandler)
    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
