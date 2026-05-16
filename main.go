package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"
)

var (
	products = make(map[string]Product)
	productMutex = &sync.Mutex{}
)

type Product struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	mux.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {
		var product Product
		if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		productMutex.Lock()
		defer productMutex.Unlock()

		if product.Name == "" || product.Price <= 0 {
			http.Error(w, "Missing name or invalid price", http.StatusBadRequest)
			return
		}

		product.ID = generateID()
		products[product.ID] = product

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(product)
	})

	mux.HandleFunc("GET /products/{id}", func(w http.ResponseWriter, r *http.Request) {
		productMutex.Lock()
		defer productMutex.Unlock()

		id := r.PathValue("id")
		product, exists := products[id]
		if !exists {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(product)
	})

	log.Println("Server starting on :8080...")
	http.ListenAndServe(":8080", mux)
}

func generateID() string {
	return string(rand.Intn(10000))
}