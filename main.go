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

    // Health endpoint – only GET allowed
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        if r.Method != http.MethodGet {
            http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
            return
        }
        // Simple health response
        if err := json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"}); err != nil {
            log.Println("error encoding health response:", err)
        }
    })

    // Products endpoint – supports GET and POST
    mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        switch r.Method {
        case http.MethodPost:
            // Decode request body
            defer r.Body.Close()
            var p store.Product
            if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
                http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
                return
            }
            // Validation
            if p.Name == "" || p.Price <= 0 {
                http.Error(w, `{"error":"invalid product data"}`, http.StatusBadRequest)
                return
            }
            // Generate ID and store safely
            p.ID = uuid.New().String()
            store.Mu.Lock()
            store.Products[p.ID] = p
            store.Mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            if err := json.NewEncoder(w).Encode(p); err != nil {
                log.Println("error encoding product response:", err)
            }
        case http.MethodGet:
            // Retrieve all products safely
            store.Mu.RLock()
            products := make([]store.Product, 0, len(store.Products))
            for _, v := range store.Products {
                products = append(products, v)
            }
            store.Mu.RUnlock()
            if err := json.NewEncoder(w).Encode(products); err != nil {
                log.Println("error encoding products list:", err)
            }
        default:
            http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
        }
    })

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
