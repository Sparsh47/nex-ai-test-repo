package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"store"
)

var productStore = store.NewProductStore()

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.Method {
		case "GET":
			productStore.RLock()
			defer productStore.RUnlock()
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

			productStore.Lock()
			defer productStore.Unlock()
			p.ID = productStore.GenerateID()
			productStore.Add(p)
			json.NewEncoder(w).Encode(p)
		}
	})

	http.ListenAndServe(":8080", nil)
}

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}