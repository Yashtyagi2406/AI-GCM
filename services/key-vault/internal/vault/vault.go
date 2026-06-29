// Package vault provides AES-256-GCM encryption for API keys.
// SRS §7.1: "API Key Vault — encrypted storage, AES-256-GCM, KMS DEK."
package vault

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

// masterKey is derived once from the VAULT_MASTER_KEY environment variable.
// Must be exactly 32 bytes (256 bits) when hex-decoded.
var masterKey []byte

func init() {
	raw := os.Getenv("VAULT_MASTER_KEY")
	if raw == "" {
		// Dev fallback — NEVER use in production
		raw = "dev0000000000000000000000000000000000000000000000000000000000000000"
	}
	decoded, err := hex.DecodeString(raw)
	if err != nil || len(decoded) != 32 {
		panic(fmt.Sprintf("VAULT_MASTER_KEY must be a 64-character hex string (32 bytes), got %d bytes", len(decoded)))
	}
	masterKey = decoded
}

// Encrypt encrypts plaintext using AES-256-GCM.
// The returned ciphertext includes the 12-byte nonce prepended:
//
//	[12 bytes nonce][ciphertext + 16 byte auth tag]
func Encrypt(plaintext string) ([]byte, error) {
	block, err := aes.NewCipher(masterKey)
	if err != nil {
		return nil, fmt.Errorf("vault encrypt: new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("vault encrypt: new gcm: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("vault encrypt: generate nonce: %w", err)
	}

	// Seal appends ciphertext+tag after the nonce
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return ciphertext, nil
}

// Decrypt decrypts a ciphertext produced by Encrypt.
func Decrypt(ciphertext []byte) (string, error) {
	block, err := aes.NewCipher(masterKey)
	if err != nil {
		return "", fmt.Errorf("vault decrypt: new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("vault decrypt: new gcm: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", fmt.Errorf("vault decrypt: ciphertext too short")
	}

	nonce, data := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, data, nil)
	if err != nil {
		return "", fmt.Errorf("vault decrypt: open: %w", err)
	}
	return string(plaintext), nil
}

// Hash returns the SHA-256 hex digest of a plaintext API key.
// Used as a lookup index (key_hash column) without storing the key in plaintext.
func Hash(plaintext string) string {
	sum := sha256.Sum256([]byte(plaintext))
	return hex.EncodeToString(sum[:])
}
