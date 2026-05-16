package main

import (
	"encoding/json"
	"log"
	"math"
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
	products      = make(map[string]Product)
	productCounter = 1
	productMutex   = &sync.Mutex{} // Thread-safe access
)

// generateID creates a unique product ID
func generateID() string {
	id := "PROD-" + string(rune(65+productCounter%26)) + string(rune(65+productCounter/26%26))
	productCounter++
	return id
}

// validateProduct checks required fields
func validateProduct(p Product) error {
	if p.Name == "" {
		return &ValidationError{Field: "name", Message: "required"}
	}
	if p.Price <= 0 {
		return &ValidationError{Field: "price", Message: "must be positive"}
	}
	return nil
}

// ValidationError represents validation errors
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
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
		case "POST":
			var p Product
			err := json.NewDecoder(r.Body).Decode(&p)
			if err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}

			productMutex.Lock()
			defer productMutex.Unlock()

			err = validateProduct(p)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"error": err,
				})
				return
			}

			p.ID = generateID()
			products[p.ID] = p

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(p)

		case "GET":
			productMutex.RLock()
			defer productMutex.RUnlock()

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(products)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.ListenAndServe(":8080", nil)
}

// Stringer implementation for error formatting
func (e *ValidationError) Error() string {
	return e.Field + ": " + e.Message
}