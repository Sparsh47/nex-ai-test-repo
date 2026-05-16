package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	var mutex sync.Mutex

	// In-memory store for demonstration purposes
	var products = map[string]string{}
	var idCounter = 0

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	mux.HandleFunc("POST /products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var product map[string]string
		if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		mutex.Lock()
		idCounter++
		products["id"] = product["name"]
		mutex.Unlock()
		json.NewEncoder(w).Encode(map[string]string{"id": "id", "name": product["name"]})
	})

	mux.HandleFunc("GET /products", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		mutex.Lock()
		defer mutex.Unlock()
		json.NewEncoder(w).Encode(products)
	})

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
