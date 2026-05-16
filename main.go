package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
)

// Product represents our data model
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// In-memory store with concurrency control
var (
	productsStore = struct {
		mutex sync.Mutex
		data  map[string]Product
	}{
		data: make(map[string]Product),
	}

	nextID = 1
)

// generateID creates a simple numeric ID
func generateID() string {
	nextID++
	return strconv.Itoa(nextID)
}

// Product handlers
func createProductHandler(w http.ResponseWriter, r *http.Request) {
	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Missing name or invalid price", http.StatusBadRequest)
		return
	}

	productsStore.mutex.Lock()
	product.ID = generateID()
	productsStore.data[product.ID] = product
	productsStore.mutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func getProductHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing product ID", http.StatusBadRequest)
		return
	}

	productsStore.mutex.Lock()
	product, exists := productsStore.data[id]
	productsStore.mutex.Unlock()

	if !exists {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	// Product routes
	mux.HandleFunc("POST /products", createProductHandler)
	mux.HandleFunc("GET /products", getProductHandler)

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}