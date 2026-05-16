package main

import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/google/uuid"
	"github.com/Sparsh47/nex-ai-test-repo/store"
)

func handlePostProduct(w http.ResponseWriter, r *http.Request) {
	var product store.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Product name cannot be empty and price must be greater than zero", http.StatusBadRequest)
		return
	}

	// Generate a unique ID for the product
	product.ID = uuid.NewString()

	// Add product to store
	store.Mu.Lock()
	store.Products[product.ID] = product
	store.Mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func handleGetProduct(w http.ResponseWriter, r *http.Request) {
	// Get product from store
	store.Mu.RLock()
	product, ok := store.Products[r.URL.Path[1:]]
	store.Mu.RUnlock()

	if !ok {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	mux.HandleFunc("POST /products", handlePostProduct)
	mux.HandleFunc("GET /products/", handleGetProduct)

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
