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

    // Health check endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // Product endpoints: handle both POST and GET on the same path
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        switch r.Method {
        case http.MethodPost:
            // Decode request body into a Product struct
            var p store.Product
            if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
                http.Error(w, "Invalid JSON", http.StatusBadRequest)
                return
            }
            // Validation
            if p.Name == "" || p.Price <= 0 {
                http.Error(w, "Invalid product data", http.StatusBadRequest)
                return
            }
            // Generate a random ID for the product
            idBytes := make([]byte, 16)
            if _, err := rand.Read(idBytes); err != nil {
                http.Error(w, "Failed to generate ID", http.StatusInternalServerError)
                return
            }
            p.ID = hex.EncodeToString(idBytes)
            // Store product safely with write lock
            store.Mu.Lock()
            store.Products[p.ID] = p
            store.Mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(p)
        case http.MethodGet:
            // Retrieve all products with read lock
            store.Mu.RLock()
            products := make([]store.Product, 0, len(store.Products))
            for _, p := range store.Products {
                products = append(products, p)
            }
            store.Mu.RUnlock()
            json.NewEncoder(w).Encode(products)
        default:
            http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
