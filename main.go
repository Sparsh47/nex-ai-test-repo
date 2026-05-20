package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "log"
    "net/http"
    "github.com/Sparsh47/nex-ai-test-repo/store"
)

func main() {
    // Using Go 1.22+ standard library routing
    mux := http.NewServeMux()

    // Register health endpoint (GET only)
    mux.HandleFunc("/health", healthHandler)

    // Register product endpoint (handles both GET and POST)
    mux.HandleFunc("/products", productsHandler)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}

// healthHandler handles GET /health
func healthHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
}

// productsHandler dispatches based on HTTP method
func productsHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodPost:
        handleCreateProduct(w, r)
    case http.MethodGet:
        handleGetProducts(w, r)
    default:
        http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
    }
}

// handleCreateProduct handles POST /products
func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    var p store.Product
    if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
        http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
        return
    }
    // Validation
    if p.Name == "" || p.Price <= 0 {
        http.Error(w, `{"error":"invalid product data"}`, http.StatusBadRequest)
        return
    }
    // Generate ID
    idBytes := make([]byte, 16)
    if _, err := rand.Read(idBytes); err != nil {
        http.Error(w, `{"error":"failed to generate ID"}`, http.StatusInternalServerError)
        return
    }
    p.ID = hex.EncodeToString(idBytes)

    // Store the product safely
    store.Mu.Lock()
    store.Products[p.ID] = p
    store.Mu.Unlock()

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(p)
}

// handleGetProducts handles GET /products
func handleGetProducts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, p := range store.Products {
        products = append(products, p)
    }
    store.Mu.RUnlock()
    json.NewEncoder(w).Encode(products)
}
