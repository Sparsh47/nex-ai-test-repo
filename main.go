package main

import (
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "log"
    "net/http"

    "github.com/Sparsh47/nex-ai-test-repo/store"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        w.WriteHeader(http.StatusMethodNotAllowed)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
}

func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
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
    // Generate ID
    idBytes := make([]byte, 16)
    if _, err := rand.Read(idBytes); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate ID"})
        return
    }
    p.ID = hex.EncodeToString(idBytes)
    // Store product safely
    store.Mu.Lock()
    store.Products[p.ID] = p
    store.Mu.Unlock()
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(p)
}

func handleListProducts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, v := range store.Products {
        products = append(products, v)
    }
    store.Mu.RUnlock()
    json.NewEncoder(w).Encode(products)
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodPost:
        handleCreateProduct(w, r)
    case http.MethodGet:
        handleListProducts(w, r)
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
    }
}

func main() {
    // Using Go 1.22+ standard library routing
    mux := http.NewServeMux()

    mux.HandleFunc("/health", healthHandler)
    mux.HandleFunc("/products", productsHandler)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
