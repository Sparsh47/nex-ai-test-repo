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

    // Health endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        // Simple health check response
        if err := json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"}); err != nil {
            log.Printf("failed to write health response: %v", err)
        }
    })

    // Register product routes on the same path; the handler will dispatch based on method
    mux.HandleFunc("/products", handleProducts)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}

// handleProducts dispatches to the appropriate method handler based on HTTP method.
func handleProducts(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodPost:
        handleCreateProduct(w, r)
    case http.MethodGet:
        handleListProducts(w, r)
    default:
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusMethodNotAllowed)
        _ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
    }
}

// handleCreateProduct processes POST /products requests.
func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    var p store.Product
    if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
        return
    }
    // Validation
    if p.Name == "" || p.Price <= 0 {
        w.WriteHeader(http.StatusBadRequest)
        _ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid product data"})
        return
    }
    // Generate ID using google/uuid
    p.ID = uuid.NewString()

    // Store safely
    store.Mu.Lock()
    store.Products[p.ID] = p
    store.Mu.Unlock()

    w.WriteHeader(http.StatusCreated)
    if err := json.NewEncoder(w).Encode(p); err != nil {
        log.Printf("failed to write create product response: %v", err)
    }
}

// handleListProducts processes GET /products requests.
func handleListProducts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, p := range store.Products {
        products = append(products, p)
    }
    store.Mu.RUnlock()

    w.WriteHeader(http.StatusOK)
    if err := json.NewEncoder(w).Encode(products); err != nil {
        log.Printf("failed to write list products response: %v", err)
    }
}
