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

    // Health endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
    })

    // Register product routes with method dispatch
    mux.HandleFunc("/products", handleProducts)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}

// handleProducts dispatches based on HTTP method
func handleProducts(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodPost:
        handleCreateProduct(w, r)
    case http.MethodGet:
        handleListProducts(w, r)
    default:
        http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
    }
}

// handleCreateProduct handles POST /products
func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    var input struct {
        Name  string  `json:"name"`
        Price float64 `json:"price"`
    }
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
        return
    }
    if input.Name == "" || input.Price <= 0 {
        http.Error(w, `{"error":"validation failed"}`, http.StatusBadRequest)
        return
    }
    // generate ID
    idBytes := make([]byte, 16)
    if _, err := rand.Read(idBytes); err != nil {
        http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
        return
    }
    id := hex.EncodeToString(idBytes)
    product := store.Product{ID: id, Name: input.Name, Price: input.Price}

    store.Mu.Lock()
    store.Products[id] = product
    store.Mu.Unlock()

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(product)
}

// handleListProducts handles GET /products
func handleListProducts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    store.Mu.RLock()
    products := make([]store.Product, 0, len(store.Products))
    for _, p := range store.Products {
        products = append(products, p)
    }
    store.Mu.RUnlock()
    json.NewEncoder(w).Encode(products)
}
