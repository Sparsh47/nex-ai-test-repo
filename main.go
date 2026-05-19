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
func generateID() string {
    b := make([]byte, 16)
    _, err := rand.Read(b)
    if err != nil {
        // fallback to zero ID (unlikely)
        return ""
    }
    return hex.EncodeToString(b)
}

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
        p.ID = generateID()
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
        for _, prod := range store.Products {
            products = append(products, prod)
        }
        store.Mu.RUnlock()
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(products)
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
