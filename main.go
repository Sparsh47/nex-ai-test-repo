package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"sync"
)

// ProductStore is a thread-safe product storage
type ProductStore struct {
	Mutex    sync.RWMutex
	Products map[string]Product
}

// Product represents a product entity
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var productStore = &ProductStore{
	Products: make(map[string]Product),
}

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
	var product Product

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

	// Generate unique ID
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
	// Generate cryptographically secure random string
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const prefix = "prod-"

	// Generate 8 random characters
	chars := make([]byte, 8)
	for i := 0; i < len(chars); i++ {
		char, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters)))
		chars[i] = letters[char.Int64()]
	}

	// Check for uniqueness
	productStore.Mutex.RLock()
	defer productStore.Mutex.RUnlock()

	// If ID exists, regenerate (collision handling)
	for {
		id := fmt.Sprintf("%s%s", prefix, string(chars))
		if _, exists := productStore.Products[id]; !exists {
			return id
		}
		chars = make([]byte, 8)
		for i := 0; i < len(chars); i++ {
			char, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters)))
			chars[i] = letters[char.Int64()]
		}
	}
}
