package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	store "github.com/Sparsh47/nex-ai-test-repo/store" // Added store import
)

// Product struct for JSON serialization
 type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var productStore = store.NewMutexStore()

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	// Product routes with concurrency control
	mux.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var p Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if p.Name == "" || p.Price <= 0 {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		rand.Seed(time.Now().UnixNano())
		p.ID = strings.ToUpper("PROD-" + randomString(8))

		productStore.Lock()
		defer productStore.Unlock()

		productStore.AddProduct(p)

		json.NewEncoder(w).Encode(map[string]string{"id": p.ID})
	})

	mux.HandleFunc("GET /products/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := strings.TrimPrefix(r.URL.Path, "/products/")

		productStore.RLock()
		defer productStore.RUnlock()

		product, exists := productStore.GetProduct(id)
		if !exists {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(product)
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

// Generate random string for ID
func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}