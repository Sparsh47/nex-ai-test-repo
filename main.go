package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"strings"
	"time"
)

// Product struct defines our product data model
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var (
	products = make(map[string]Product)
	productMutex = &sync.Mutex{}
)

func main() {
	// Initialize random seed for ID generation
	rand.Seed(time.Now().UnixNano())

	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"uptime": "100%",
		})
	})

	// Product endpoints
	mux.HandleFunc("POST /products", createProductHandler)
	mux.HandleFunc("GET /products", getProductsHandler)

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

// createProductHandler handles POST /products requests
func createProductHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate content type
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		http.Error(w, "Content-Type must be application/json", http.StatusBadRequest)
		return
	}

	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if product.Name == "" {
		http.Error(w, "Product name is required", http.StatusBadRequest)
		return
	}
	if product.Price <= 0 {
		http.Error(w, "Price must be positive", http.StatusBadRequest)
		return
	}

	// Generate unique ID
	product.ID = generateID()

	// Thread-safe write
	productMutex.Lock()
	products[product.ID] = product
	productMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// getProductsHandler handles GET /products requests
func getProductsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Thread-safe read
	productMutex.Lock()
	productList := make([]Product, 0, len(products))
	for _, p := range products {
		productList = append(productList, p)
	}
	productMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productList)
}

// generateID creates a simple random ID
func generateID() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	id := make([]byte, 8)
	for i := range id {
		id[i] = chars[rand.Intn(len(chars))]
	}
	return string(id)
}