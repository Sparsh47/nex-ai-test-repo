package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"

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
    mux.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        var input struct {
            Name  string  `json:"name"`
            Price float64 `json:"price"`
        }
        if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
            http.Error(w, fmt.Sprintf("invalid JSON: %v", err), http.StatusBadRequest)
            return
        }
        // Validation
        if input.Name == "" {
            http.Error(w, "product name cannot be empty", http.StatusBadRequest)
            return
        }
        if input.Price <= 0 {
            http.Error(w, "product price must be greater than 0", http.StatusBadRequest)
            return
        }
        // Generate ID (simple timestamp based ID)
        id := fmt.Sprintf("%d", time.Now().UnixNano())
        product := store.Product{ID: id, Name: input.Name, Price: input.Price}
        // Store safely
        store.Mu.Lock()
        store.Products[id] = product
        store.Mu.Unlock()
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(product)
    })

    mux.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        store.Mu.RLock()
        defer store.Mu.RUnlock()
        products := make([]store.Product, 0, len(store.Products))
        for _, p := range store.Products {
            products = append(products, p)
        }
        json.NewEncoder(w).Encode(products)
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
