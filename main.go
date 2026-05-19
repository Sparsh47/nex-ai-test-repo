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

    // Register health endpoint (GET only)
    mux.HandleFunc("/health", healthHandler)

    // Register product endpoint (handles GET and POST)
    mux.HandleFunc("/products", productsHandler)

    log.Println("Go Server starting on :8080...")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}

// healthHandler responds with a simple JSON status.
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    if r.Method != http.MethodGet {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    // Example health payload
    _ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
}

// productsHandler dispatches based on HTTP method.
func productsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    switch r.Method {
    case http.MethodPost:
        handleCreateProduct(w, r)
    case http.MethodGet:
        handleListProducts(w, r)
    default:
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
    }
}

// handleCreateProduct decodes a product, validates, assigns an ID, and stores it.
func handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    defer r.Body.Close()
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
    // Generate ID (timestamp based unique string)
    id := fmt.Sprintf("%d", time.Now().UnixNano())
    product := store.Product{ID: id, Name: input.Name, Price: input.Price}
    // Store safely
    store.Mu.Lock()
    store.Products[id] = product
    store.Mu.Unlock()
    w.WriteHeader(http.StatusCreated)
    if err := json.NewEncoder(w).Encode(product); err != nil {
        log.Printf("error encoding response: %v", err)
    }
}

// handleListProducts returns all stored products as a JSON array.
func handleListProducts(w http.ResponseWriter, r *http.Request) {
    store.Mu.RLock()
    defer store.Mu.RUnlock()
    products := make([]store.Product, 0, len(store.Products))
    for _, p := range store.Products {
        products = append(products, p)
    }
    if err := json.NewEncoder(w).Encode(products); err != nil {
        log.Printf("error encoding products list: %v", err)
    }
}
