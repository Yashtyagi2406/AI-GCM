package writer_test

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"testing"
	"time"
)

// These tests validate the hash-chain computation logic without a live DB.
// They directly re-implement the hash formula from writer.go to verify
// mathematical correctness.

var testSigningKey = []byte("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1") // 32 bytes

func computeHash(seqNum int64, orgID, eventType, payloadJSON, prevHash string) string {
	raw := fmt.Sprintf("%d|%s|%s|%s|%s", seqNum, orgID, eventType, payloadJSON, prevHash)
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}

func computeHMAC(entryHash string, key []byte) string {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(entryHash))
	return hex.EncodeToString(mac.Sum(nil))
}

// TestHashChainDeterminism ensures the same input always produces the same hash.
func TestHashChainDeterminism(t *testing.T) {
	h1 := computeHash(1, "org-1", "api_request", `{"model":"gpt-4o"}`, "")
	h2 := computeHash(1, "org-1", "api_request", `{"model":"gpt-4o"}`, "")
	if h1 != h2 {
		t.Errorf("hash should be deterministic: %s != %s", h1, h2)
	}
}

// TestHashChainLinksCorrectly verifies that each entry's prevHash matches
// the previous entry's entryHash.
func TestHashChainLinksCorrectly(t *testing.T) {
	org := "org-abc"
	var prevHash string

	type entry struct {
		seqNum int64
		hash   string
		prev   string
	}
	entries := make([]entry, 5)

	for i := int64(0); i < 5; i++ {
		payload := fmt.Sprintf(`{"seq":%d}`, i+1)
		h := computeHash(i+1, org, "api_request", payload, prevHash)
		entries[i] = entry{seqNum: i + 1, hash: h, prev: prevHash}
		prevHash = h
	}

	// Verify chain
	for i := 1; i < len(entries); i++ {
		if entries[i].prev != entries[i-1].hash {
			t.Errorf("seq %d: prevHash=%s does not match seq %d hash=%s",
				entries[i].seqNum, entries[i].prev,
				entries[i-1].seqNum, entries[i-1].hash)
		}
	}
}

// TestHashChangesWithContent verifies that different payloads produce different hashes.
func TestHashChangesWithContent(t *testing.T) {
	h1 := computeHash(1, "org-1", "api_request", `{"model":"gpt-4o"}`, "")
	h2 := computeHash(1, "org-1", "api_request", `{"model":"claude-3"}`, "")
	if h1 == h2 {
		t.Error("different payloads should produce different hashes")
	}
}

// TestHashChangesWithOrgID ensures org isolation in hash space.
func TestHashChangesWithOrgID(t *testing.T) {
	h1 := computeHash(1, "org-A", "api_request", `{}`, "")
	h2 := computeHash(1, "org-B", "api_request", `{}`, "")
	if h1 == h2 {
		t.Error("different org IDs should produce different hashes")
	}
}

// TestHMACDeterminism ensures HMAC over the same hash is stable.
func TestHMACDeterminism(t *testing.T) {
	h := computeHash(1, "org-1", "api_request", `{}`, "")
	sig1 := computeHMAC(h, testSigningKey)
	sig2 := computeHMAC(h, testSigningKey)
	if sig1 != sig2 {
		t.Error("HMAC should be deterministic")
	}
}

// TestHMACChangesWithKey ensures different keys produce different MACs.
func TestHMACChangesWithKey(t *testing.T) {
	h := computeHash(1, "org-1", "api_request", `{}`, "")
	key1 := []byte("key1key1key1key1key1key1key1key1") // 32 bytes
	key2 := []byte("key2key2key2key2key2key2key2key2")
	sig1 := computeHMAC(h, key1)
	sig2 := computeHMAC(h, key2)
	if sig1 == sig2 {
		t.Error("different HMAC keys should produce different signatures")
	}
}

// TestTamperedHashDetection simulates what the verifier would catch.
func TestTamperedHashDetection(t *testing.T) {
	org := "org-tamper"
	h1 := computeHash(1, org, "api_request", `{"original":true}`, "")
	h2 := computeHash(2, org, "api_request", `{"original":true}`, h1)

	// Simulate a tampered h1
	tamperedH1 := h1[:len(h1)-1] + "X"

	// h2 was computed with the real h1 as prevHash
	// Verifier would recompute h2 with tampered h1 and detect mismatch
	recomputedH2 := computeHash(2, org, "api_request", `{"original":true}`, tamperedH1)

	if recomputedH2 == h2 {
		t.Error("tampering h1 should change h2 — hash chain broken")
	}
}

// TestEmptyPayload ensures hash works with empty payload.
func TestEmptyPayload(t *testing.T) {
	h := computeHash(1, "org-1", "key_rotation", `{}`, "")
	if len(h) != 64 {
		t.Errorf("SHA-256 hex should be 64 chars, got %d", len(h))
	}
}

// TestHashIs64Chars ensures SHA-256 output length is always correct.
func TestHashIs64Chars(t *testing.T) {
	cases := []struct {
		seq     int64
		payload string
	}{
		{1, `{}`},
		{999999, `{"very_long_key":"` + fmt.Sprintf("%0200d", 0) + `"}`},
	}
	for _, c := range cases {
		h := computeHash(c.seq, "org", "type", c.payload, "prevhash")
		if len(h) != 64 {
			t.Errorf("seq=%d: expected 64-char hash, got %d", c.seq, len(h))
		}
	}
}

// Ensure test runs fast — hash operations should complete in < 1ms each.
func TestHashPerformance(t *testing.T) {
	start := time.Now()
	for i := 0; i < 10_000; i++ {
		computeHash(int64(i), "org-perf", "api_request", `{"model":"gpt-4o"}`, "prevhash")
	}
	elapsed := time.Since(start)
	if elapsed.Milliseconds() > 500 {
		t.Errorf("10k hash operations took %s — too slow", elapsed)
	}
}
