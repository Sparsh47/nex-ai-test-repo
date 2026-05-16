package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"store"
)

var productStore = store.NewProductStore()

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	http.HandleFunc("/products", createProduct)
	http.HandleFunc("/products/", getProduct)

	http.ListenAndServe(":8080", nil)
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	var product struct {
		Name  string  `json:"name"`
		Price float64 `json:"price"`
	}

	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	productStore.Mutex.Lock()
	defer productStore.Mutex.Unlock()

	product.ID = generateID()
	productStore.Products[product.ID] = product

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func getProduct(w http.ResponseWriter, r *http.Request) {
	ID := r.URL.Path[len("/products/"):] // Extract ID from URL

	productStore.Mutex.RLock()
	defer productStore.Mutex.RUnlock()

	product, exists := productStore.Products[ID]
	if !exists {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func generateID() string {
	// Simple UUID-like format for example purposes
	return "prod-" + randomString(8)
}

func randomString(n int) string {
	// Basic random string generator
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}