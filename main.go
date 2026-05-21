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

    // POST /products handler
    mux.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        var p store.Product
        if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
            http.Error(w, "invalid JSON", http.StatusBadRequest)
            return
        }
        // Validation
        if p.Name == "" || p.Price <= 0 {
            http.Error(w, "invalid product data", http.StatusBadRequest)
            return
        }
        // Generate ID
        p.ID = uuid.New().String()
        // Store product safely
        store.Mu.Lock()
        store.Products[p.ID] = p
        store.Mu.Unlock()
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(p)
    })

    // GET /products handler
    mux.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        store.Mu.RLock()
        products := make([]store.Product, 0, len(store.Products))
        for _, v := range store.Products {
            products = append(products, v)
        }
        store.Mu.RUnlock()
        json.NewEncoder(w).Encode(products)
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
