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

    // Health check endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // POST /products handler
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        var input struct {
            Name  string  `json:"name"`
            Price float64 `json:"price"`
        }
        if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
            http.Error(w, "invalid JSON", http.StatusBadRequest)
            return
        }
        if input.Name == "" || input.Price <= 0 {
            http.Error(w, "name and price are required and price must be > 0", http.StatusBadRequest)
            return
        }
        prod := store.Product{
            ID:    uuid.New().String(),
            Name:  input.Name,
            Price: input.Price,
        }
        store.Mu.Lock()
        store.Products[prod.ID] = prod
        store.Mu.Unlock()
        w.WriteHeader(http.StatusCreated)
        if err := json.NewEncoder(w).Encode(prod); err != nil {
            http.Error(w, "failed to encode response", http.StatusInternalServerError)
        }
    })

    // GET /products handler
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        store.Mu.RLock()
        products := make([]store.Product, 0, len(store.Products))
        for _, p := range store.Products {
            products = append(products, p)
        }
        store.Mu.RUnlock()
        w.WriteHeader(http.StatusOK)
        if err := json.NewEncoder(w).Encode(products); err != nil {
            http.Error(w, "failed to encode response", http.StatusInternalServerError)
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
