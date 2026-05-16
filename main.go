package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

// Product represents a product entity
// swagger:model
// @Description Product entity
// @name Product
// @in body
// @required name
// @required id
// @Success 200 {object} Product
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /products [post]
// @Router /products [get]
// @Router /health [get]
type Product struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// Products is a thread-safe product store
// swagger:model
// @Description Thread-safe product store
// @name Products
// @in body
// @required products
// @Success 200 {object} Products
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /products [get]
type Products struct {
	mu    sync.RWMutex
	items map[string]Product
}

var productStore = Products{
	items: make(map[string]Product),
}

func main() {
	rand.Seed(time.Now().UnixNano())

	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	// Create product endpoint
	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var product Product
		if err := json.NewDecoder(r.Body).Decode(&product);
		err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if product.Name == "" {
			http.Error(w, "Product name is required", http.StatusBadRequest)
			return
		}

		productStore.mu.Lock()
		defer productStore.mu.Unlock()

		product.ID = generateID()
		productStore.items[product.ID] = product

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(product)
	})

	// Get products endpoint
	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		productStore.mu.RLock()
		defer productStore.mu.RUnlock()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(productStore.items)
	})

	log.Println("Server starting on :8080")
	http.ListenAndServe(":8080", mux)
}

// generateID creates a random 8-character alphanumeric ID
func generateID() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return string(b)
}