package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// Product represents a product
func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	// Create a store
	var store = struct {
		sync.RWMutex
		products map[string]Product
	}{}
	store.products = map[string]Product{}

	// Define routes
	mux.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlePostProduct(w, r, &store)
		case http.MethodGet:
			handleGetProducts(w, r, &store)
		default:
			http.Error(w, "Invalid request method", http.StatusBadRequest)
		}
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

// handlePostProduct handles the POST /products endpoint
func handlePostProduct(w http.ResponseWriter, r *http.Request, store *struct { sync.RWMutex; products map[string]Product }) {
	var product Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate product
	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Invalid product", http.StatusBadRequest)
		return
	}

	// Add product to store
	store.Lock()
	store.products[product.ID] = product
	store.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// handleGetProducts handles the GET /products endpoint
func handleGetProducts(w http.ResponseWriter, r *http.Request, store *struct { sync.RWMutex; products map[string]Product }) {
	// Get all products from store
	store.RLock()
	products := store.products
	store.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

// Product represents a product
func Product(name string, price float64, id string) Product {
	return Product{
		Name: name,
		Price: price,
		ID:   id,
	}
}

// Product represents a product
func (p *Product) UnmarshalJSON(data []byte) error {
	var aux struct {
		Name string `json:"name"`
		Price float64 `json:"price"`
		ID   string `json:"id"`
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	*p = Product{
		Name: aux.Name,
		Price: aux.Price,
		ID:   aux.ID,
	}
	return nil
}

// Product represents a product
func (p Product) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Name string `json:"name"`
		Price float64 `json:"price"`
		ID   string `json:"id"`
	} {
		Name: p.Name,
		Price: p.Price,
		ID:   p.ID,
	})
}

// Product represents a product
type Product struct {
	Name string `json:"name"`
	Price float64 `json:"price"`
	ID   string `json:"id"`
}
