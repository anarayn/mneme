// mneme-scheduler — Prospective memory trigger evaluator
//
// Evaluates prospective intents stored in PostgreSQL against real-time events.
// Fires triggers via Kafka → notifier service.
// Runs as HA pair (2 replicas) — one active, one standby.
package main

import (
	"log"
	"os"
	"time"
)

// Intent represents a prospective memory entry
type Intent struct {
	ID          string
	UserID      string
	Type        string // "deadline", "event_pattern", "time_based"
	Pattern     string
	ActionJSON  string
	DueAt       time.Time
	Criticality int
	Fired       bool
}

// Scheduler periodically evaluates intents and fires triggers
type Scheduler struct {
	checkInterval time.Duration
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		checkInterval: 30 * time.Second,
	}
}

func (s *Scheduler) run() {
	ticker := time.NewTicker(s.checkInterval)
	defer ticker.Stop()

	log.Println("mneme-scheduler started, check interval:", s.checkInterval)

	for range ticker.C {
		if err := s.evaluateIntents(); err != nil {
			log.Printf("scheduler error: %v", err)
		}
	}
}

func (s *Scheduler) evaluateIntents() error {
	// TODO:
	// 1. Query PostgreSQL for intents with due_at <= NOW()
	// 2. For each intent, evaluate pattern against current state
	// 3. Emit mneme.prospective.triggers Kafka event if matched
	// 4. Mark intent as fired in PostgreSQL
	return nil
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	scheduler := NewScheduler()
	log.Printf("mneme-scheduler starting on :%s", port)
	scheduler.run()
}
