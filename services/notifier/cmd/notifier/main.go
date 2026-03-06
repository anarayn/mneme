// mneme-notifier — Proactive outbound message dispatcher
//
// Consumes mneme.prospective.triggers Kafka topic.
// Sends proactive notifications to users via their preferred channel.
package main

import (
	"log"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}
	log.Printf("mneme-notifier starting on :%s", port)
	// TODO: start Kafka consumer for mneme.prospective.triggers
	select {} // block forever
}
