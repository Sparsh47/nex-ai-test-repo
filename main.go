package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// Product represents a product entity
type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var (
	products  = make(map[string]Product)
	productID = 1
	mutex     sync.Mutex
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case "POST":
			var p Product
			err := json.NewDecoder(r.Body).Decode(&p)
			if err != nil {
				http.Error(w, "Invalid request payload", http.StatusBadRequest)
				return
			}

			if p.Name == "" || p.Price <= 0 {
				http.Error(w, "Name and positive price required", http.StatusBadRequest)
				return
			}

			mutex.Lock()
			defer mutex.Unlock()

			p.ID = generateID()
			products[p.ID] = p

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(p)

		case "GET":
			mutex.Lock()
			defer mutex.Unlock()

			productList := make([]Product, 0, len(products))
			for _, p := range products {
				productList = append(productList, p)
			}

			json.NewEncoder(w).Encode(productList)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.ListenAndServe(":8080", nil)
}

func generateID() string {
	mutex.Lock()
	defer mutex.Unlock()

	id := productID
	productID++
	return string(rune(id))
}
