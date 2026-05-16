package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"strconv"
)

// In-memory product store with concurrency control
var (
	products = make(map[string]Product)
	productMutex = &sync.Mutex{}
)

// Product model
type Product struct {
	ID    string  `json:id`
	Name  string  `json:name`
	Price float64 `json:price`
}

func main() {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	// Product routes
	mux.HandleFunc("POST /products", createProduct)
	mux.HandleFunc("GET /products/{id}", getProduct)

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

// Create product handler
func createProduct(w http.ResponseWriter, r *http.Request) {
	productMutex.Lock()
	defer productMutex.Unlock()

	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validation
	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Name and price are required", http.StatusBadRequest)
		return
	}

	// Generate ID
	product.ID = generateID()

	// Store product
	products[product.ID] = product

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// Get product handler
func getProduct(w http.ResponseWriter, r *http.Request) {
	productMutex.Lock()
	defer productMutex.Unlock()

	// Extract ID from URL
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Product ID required", http.StatusBadRequest)
		return
	}

	product, exists := products[id]
	if !exists {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// Simple ID generator
func generateID() string {
	// In production use UUID or similar
	return strconv.Itoa(len(products) + 1)
}