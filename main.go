package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
)

// Product represents a product entity

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// Thread-safe product store

type ProductStore struct {
	products map[string]Product
	mutex    sync.Mutex
}

var store = &ProductStore{
	products: make(map[string]Product),
}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case "GET":
			store.mutex.Lock()
			defer store.mutex.Unlock()

			products := make([]Product, 0, len(store.products))
			for _, p := range store.products {
				products = append(products, p)
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(products)

		case "POST":
			var p Product
			err := json.NewDecoder(r.Body).Decode(&p)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if p.Name == "" || p.Price <= 0 {
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			store.mutex.Lock()
			defer store.mutex.Unlock()

			// Generate UUID-like ID
			id := strconv.Itoa(rand.Intn(1000000))
			p.ID = id

			store.products[id] = p
			w.Header().Set("Location", "/products/"+id)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(p)

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	http.ListenAndServe(":8080", nil)
