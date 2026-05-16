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
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // Register product routes
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        switch r.Method {
        case http.MethodPost:
            var p store.Product
            if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
                http.Error(w, "invalid JSON", http.StatusBadRequest)
                return
            }
            // Validate fields
            if p.Name == "" || p.Price <= 0 {
                http.Error(w, "invalid product data", http.StatusBadRequest)
                return
            }
            // Generate ID
            p.ID = uuid.New().String()
            // Store safely
            store.Mu.Lock()
            store.Products[p.ID] = p
            store.Mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(p)
        case http.MethodGet:
            store.Mu.RLock()
            products := make([]store.Product, 0, len(store.Products))
            for _, prod := range store.Products {
                products = append(products, prod)
            }
            store.Mu.RUnlock()
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(products)
        default:
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
