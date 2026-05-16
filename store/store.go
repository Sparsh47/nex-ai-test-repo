package store

import "sync"

type Product struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

// In-memory thread-safe store
var (
	Products = make(map[string]Product)
	Mu       sync.RWMutex
)
