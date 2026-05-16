package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlePostProduct(w, r)
		case http.MethodGet:
			handleGetProducts(w, r)
		default:
			http.Error(w, "Invalid request method", http.StatusBadRequest)
		}
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

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

	// Add product to store
	store.Mu.Lock()
	store.Products[product.ID] = product
	store.Mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func handleGetProducts(w http.ResponseWriter, r *http.Request) {
	// Get all products from store
	store.Mu.RLock()
	products := store.Products
	store.Mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}
