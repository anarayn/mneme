// mneme-gateway — WebSocket session router + Fly Machines VM lifecycle
//
// Responsibilities:
//   - 1:1 user → Fly VM routing (session affinity)
//   - WebSocket manager (100K concurrent connections)
//   - Reconnection without losing working memory
//   - Firecracker VM lifecycle via Fly Machines API
//   - Health check endpoints
//   - Backpressure handling
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Edge layer already validates auth
	},
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
}

// Session maps user ID to their Fly VM address
type Session struct {
	UserID    string
	VMAddress string
	CreatedAt time.Time
	Conn      *websocket.Conn
}

// SessionRouter routes users to their dedicated VMs
type SessionRouter struct {
	mu       sync.RWMutex
	sessions map[string]*Session
	flyToken string
	flyApp   string
}

func NewSessionRouter() *SessionRouter {
	return &SessionRouter{
		sessions: make(map[string]*Session),
		flyToken: os.Getenv("FLY_API_TOKEN"),
		flyApp:   os.Getenv("FLY_APP_NAME"),
	}
}

// getOrCreateVM returns an existing VM address or provisions a new Fly Machine
func (sr *SessionRouter) getOrCreateVM(userID string) (string, error) {
	sr.mu.RLock()
	if s, ok := sr.sessions[userID]; ok {
		sr.mu.RUnlock()
		return s.VMAddress, nil
	}
	sr.mu.RUnlock()

	// TODO: call Fly Machines API to create/wake microVM
	// POST https://api.machines.dev/v1/apps/{app}/machines
	vmAddr := fmt.Sprintf("http://vm-%s.internal:8080", userID[:8])

	sr.mu.Lock()
	sr.sessions[userID] = &Session{
		UserID:    userID,
		VMAddress: vmAddr,
		CreatedAt: time.Now(),
	}
	sr.mu.Unlock()

	return vmAddr, nil
}

func (sr *SessionRouter) handleSession(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-Id")
	if userID == "" {
		http.Error(w, "missing user ID", http.StatusBadRequest)
		return
	}

	vmAddr, err := sr.getOrCreateVM(userID)
	if err != nil {
		http.Error(w, "failed to provision VM", http.StatusInternalServerError)
		return
	}

	if websocket.IsWebSocketUpgrade(r) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("websocket upgrade failed: %v", err)
			return
		}
		defer conn.Close()

		// Proxy WebSocket to the agent VM
		// TODO: establish WS connection to vmAddr and bidirectionally proxy
		log.Printf("session %s → %s", userID, vmAddr)

		for {
			msgType, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}
			// Echo for now — real impl proxies to VM
			if err := conn.WriteMessage(msgType, msg); err != nil {
				break
			}
		}
		return
	}

	// REST proxy to VM
	w.Header().Set("X-VM-Address", vmAddr)
	json.NewEncoder(w).Encode(map[string]string{"vm": vmAddr, "user": userID})
}

func main() {
	router := NewSessionRouter()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/session", router.handleSession)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("mneme-gateway listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
