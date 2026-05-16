package main

import (
	"encoding/json"
	"log"
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
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if product.Name == "" {
			http.Error(w, "Product name is required", http.StatusBadRequest)
			return
		}

		productMutex.Lock()
		product.ID = generateID()
		products[product.ID] = product
		productMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(product)
	})

	mux.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {
		productMutex.Lock()
		productList := make([]Product, 0, len(products))
		for _, product := range products {
			productList = append(productList, product)
		}
		productMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productList)
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

func generateID() string {
	// Simple ID generation for example purposes
	// In production use UUID or similar
	return "prod-" + randomString(8)
}

func randomString(n int) string {
	// Basic random string implementation
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var result string
	for i := 0; i < n; i++ {
		result += string(letters[rand.Intn(len(letters))])
	}
	return result
}
