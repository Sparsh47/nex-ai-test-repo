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

    // /products endpoint handling both POST and GET
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        switch r.Method {
        case http.MethodPost:
            // Decode request body
            var input struct {
                Name  string  `json:"name"`
                Price float64 `json:"price"`
            }
            if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
                http.Error(w, "invalid JSON", http.StatusBadRequest)
                return
            }
            // Validate required fields
            if input.Name == "" || input.Price <= 0 {
                http.Error(w, "name and price are required and price must be > 0", http.StatusBadRequest)
                return
            }
            // Create product with generated UUID
            prod := store.Product{
                ID:    uuid.New().String(),
                Name:  input.Name,
                Price: input.Price,
            }
            // Store product with write lock
            store.Mu.Lock()
            store.Products[prod.ID] = prod
            store.Mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            if err := json.NewEncoder(w).Encode(prod); err != nil {
                http.Error(w, "failed to encode response", http.StatusInternalServerError)
            }
        case http.MethodGet:
            // Retrieve all products with read lock
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
        default:
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
