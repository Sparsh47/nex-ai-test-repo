package main

import (
	"fmt"
	"net/http"
	"sync"
	"encoding/json"
)

var (
	products map[string]Product
	productMutex sync.Mutex
)

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func main() {
	products = make(map[string]Product)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("{\"status\":\"healthy\"}"))
	})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
	
case "POST":
			var p Product
			err := json.NewDecoder(r.Body).Decode(&p)
			if err != nil {
				http.Error(w, "Invalid request", http.StatusBadRequest)
				return
			}

			if p.Name == "" || p.Price <= 0 {
				http.Error(w, "Invalid product data", http.StatusBadRequest)
				return
			}

			p.ID = generateID()
			productMutex.Lock()
			products[p.ID] = p
			productMutex.Unlock()

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(p)

		case "GET":
			productMutex.Lock()
			defer productMutex.Unlock()

			var productList []Product
			for _, p := range products {
				productList = append(productList, p)
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(productList)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.ListenAndServe(":8080", nil)
}

func generateID() string {
	// Simple ID generation for example
	return fmt.Sprintf("product-%d", len(products)+1)
}