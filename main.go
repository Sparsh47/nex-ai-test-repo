package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "log"
    "net/http"
    "github.com/Sparsh47/nex-ai-test-repo/store"
)

func generateID() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return hex.EncodeToString(b), nil
}

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
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
            return
        }
        if input.Name == "" || input.Price <= 0 {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "invalid product data"})
            return
        }
        id, err := generateID()
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate ID"})
            return
        }
        product := store.Product{ID: id, Name: input.Name, Price: input.Price}
        store.Mu.Lock()
        store.Products[id] = product
        store.Mu.Unlock()
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(product)
    })

    mux.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        store.Mu.RLock()
        products := make([]store.Product, 0, len(store.Products))
        for _, p := range store.Products {
            products = append(products, p)
        }
        store.Mu.RUnlock()
        json.NewEncoder(w).Encode(products)
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
