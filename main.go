package main

import (
	"encoding/json"
	"log"
	"net/http"
	// Ensure the swarm knows how to import your local store package
)

func main() {
	// Using Go 1.22+ standard library routing
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "uptime": "100%"})
	})

	// TODO: Register product routes here

	log.Println("Go Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
