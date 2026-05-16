package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

var (
	products = make(map[string]Product)
	productMutex = &sync.Mutex{} // Thread-safe access
	idCounter = 0
)

// Product model
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// POST /products - Create product
func createProductHandler(w http.ResponseWriter, r *http.Request) {
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
	idCounter++
	product.ID = fmt.Sprintf("P%04d", idCounter)

	products[product.ID] = product

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// GET /products - List products
func getProductsHandler(w http.ResponseWriter, r *http.Request) {
	productMutex.Lock()
	defer productMutex.Unlock()

	// Convert map to slice for JSON response
	productList := make([]Product, 0, len(products))
	for _, product := range products {
		productList = append(productList, product)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productList)
}

// Health check
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func main() {
	http.HandleFunc("/health", healthCheckHandler)
	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			createProductHandler(w, r)
		case http.MethodGet:
			getProductsHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      nil,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	srv.ListenAndServe()
}