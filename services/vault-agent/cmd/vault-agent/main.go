// mneme-vault-agent — HashiCorp Vault sidecar
//
// Runs as Kubernetes DaemonSet (1 per node).
// Responsibilities:
//   - Vault token renewal (renewable tokens with auto-refresh)
//   - Secret injection into pod environment
//   - Policy enforcement (agent role restrictions)
package main

import (
	"log"
	"os"
	"time"
)

func main() {
	vaultAddr := os.Getenv("VAULT_ADDR")
	if vaultAddr == "" {
		vaultAddr = "https://vault.mneme.internal:8200"
	}
	log.Printf("mneme-vault-agent starting, vault addr: %s", vaultAddr)

	// TODO: initialize hvac client, start token renewal loop
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		log.Println("vault-agent: renewing tokens")
		// TODO: renew all active tokens
	}
}
