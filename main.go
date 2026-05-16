package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

var productStore = newProductStore()

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case "GET":
			productStore.mu.RLock()
			defer productStore.mu.RUnlock()
			json.NewEncoder(w).Encode(productStore.GetAll())

		case "POST":
			var p Product
			err := json.NewDecoder(r.Body).Decode(&p)
			if err != nil {
				http.Error(w, "Invalid request payload", http.StatusBadRequest)
				return
			}

			if p.Name == "" || p.Price <= 0 {
				http.Error(w, "Missing required fields", http.StatusBadRequest)
				return
			}

			productStore.mu.Lock()
			defer productStore.mu.Unlock()
			p.ID = productStore.GenerateID()
			productStore.Add(p)
			json.NewEncoder(w).Encode(p)
		}
	})

	http.ListenAndServe(":8080", nil)
}

// ProductStore implements thread-safe product storage

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type ProductStore struct {
	products map[string]Product
	mu       sync.RWMutex
	nextID   int
}

func newProductStore() *ProductStore {
	return &ProductStore{
		products: make(map[string]Product),
		nextID:   1,
	}
}

func (s *ProductStore) GenerateID() string {
	s.nextID++
	return fmt.Sprintf("product-%d", s.nextID)
}

func (s *ProductStore) Add(p Product) {
	s.products[p.ID] = p
}

func (s *ProductStore) GetAll() []Product {
	products := make([]Product, 0, len(s.products))
	for _, p := range s.products {
		products = append(products, p)
	}
	return products
}