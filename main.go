package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "log"
    "net/http"

    "github.com/Sparsh47/nex-ai-test-repo/store"
)

// generateID creates a random 16-byte hex string to be used as a product ID.
func generateID() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return hex.EncodeToString(b), nil
}

func main() {
    mux := http.NewServeMux()

    // Health check endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // Products endpoint handling both POST and GET
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        switch r.Method {
        case http.MethodPost:
            // Decode request body
            var payload struct {
                Name  string  `json:"name"`
                Price float64 `json:"price"`
            }
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                w.WriteHeader(http.StatusBadRequest)
                json.NewEncoder(w).Encode(map[string]string{"error": "invalid JSON"})
                return
            }
            // Validation
            if payload.Name == "" || payload.Price <= 0 {
                w.WriteHeader(http.StatusBadRequest)
                json.NewEncoder(w).Encode(map[string]string{"error": "validation failed"})
                return
            }
            // Generate ID
            id, err := generateID()
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                json.NewEncoder(w).Encode(map[string]string{"error": "could not generate ID"})
                return
            }
            // Create product and store it safely
            product := store.Product{ID: id, Name: payload.Name, Price: payload.Price}
            store.Mu.Lock()
            store.Products[id] = product
            store.Mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(product)
        case http.MethodGet:
            // Retrieve all products safely
            store.Mu.RLock()
            products := make([]store.Product, 0, len(store.Products))
            for _, p := range store.Products {
                products = append(products, p)
            }
            store.Mu.RUnlock()
            json.NewEncoder(w).Encode(products)
        default:
            w.WriteHeader(http.StatusMethodNotAllowed)
            json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
