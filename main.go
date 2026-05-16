package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// Store represents an in-memory product catalog
// TODO: Replace with a proper database
var Store = map[string]Product{}
var Mu = sync.RWMutex{}

type Product struct {
	Name  string `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlePostProduct(w, r)
		case http.MethodGet:
			handleGetProducts(w, r)
		default:
			http.Error(w, "Unsupported method", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

func handlePostProduct(w http.ResponseWriter, r *http.Request) {
	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Invalid product", http.StatusBadRequest)
		return
	}

	Mu.Lock()
	Store[product.Name] = product
	Mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func handleGetProducts(w http.ResponseWriter, r *http.Request) {
	Mu.RLock()
	products := make([]Product, 0, len(Store))
	for _, product := range Store {
		products = append(products, product)
	}
	Mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}
