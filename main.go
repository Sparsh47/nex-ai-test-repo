package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
)

var (
	productsStore = &store.MutexStore{Data: make(map[string]Product)}
	nextID        = 1
	idMutex      sync.Mutex
)

type Product struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Price float64 `json:"price"`
}

func generateID() string {
	idMutex.Lock()
	defer idMutex.Unlock()
	id := strconv.Itoa(nextID)
	nextID++
	return id
}

func createProductHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	return
	}

	var p Product
	if err := json.NewDecoder(r.Body).Decode(&p);
	err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if p.Name == "" || p.Price <= 0 {
	http.Error(w, "Invalid product data", http.StatusBadRequest)
	return
	}

	p.ID = generateID()

	productsStore.Lock()
	defer productsStore.Unlock()

	productsStore.Data[p.ID] = p

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func getProductHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	return
	}

	vars := mux.Vars(r)
	id := vars["id"]

	productsStore.RLock()
	defer productsStore.RUnlock()

	product, exists := productsStore.Data[id]
	if !exists {
	http.Error(w, "Product not found", http.StatusNotFound)
	return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", healthCheckHandler)
	mux.HandleFunc("/products", createProductHandler)
	mux.HandleFunc("/products/", getProductHandler)

	log.Println("Server starting on :8080...")
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}

// MutexStore implements thread-safe map operations
type MutexStore struct {
	mu    sync.RWMutex
	Data  map[string]Product
}

func (s *MutexStore) Lock()   { s.mu.Lock() }
func (s *MutexStore) Unlock() { s.mu.Unlock() }
func (s *MutexStore) RLock()  { s.mu.RLock() }
func (s *MutexStore) RUnlock() { s.mu.RUnlock() }