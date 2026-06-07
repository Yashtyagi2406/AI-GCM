package cache

import (
	"context"
	"crypto/sha256"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	defaultTTL = time.Hour
	keyPrefix  = "aigcm:cache:"
)

// SemanticCache provides SHA-256 keyed response caching via Redis.
// SRS §5.4: "Semantic caching for repeated/similar prompts — Redis + vector similarity."
// SRS §10.5: "Semantic Caching: Vector similarity >0.95 = cache hit. Target: 10–30% saving."
//
// MVP implementation uses exact SHA-256 hash matching (Phase 1).
// Phase 4 upgrade: replace with pgvector cosine similarity for ~0.95 threshold.
type SemanticCache struct {
	client *redis.Client
}

// NewSemanticCache creates a new cache backed by the given Redis client.
func NewSemanticCache(client *redis.Client) *SemanticCache {
	return &SemanticCache{client: client}
}

// Get retrieves a cached response. Returns (response, true) on hit.
func (c *SemanticCache) Get(ctx context.Context, provider, model, prompt string) ([]byte, bool) {
	key := buildKey(provider, model, prompt)
	val, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		return nil, false
	}
	return val, true
}

// Set stores a response in the cache with the given TTL.
// Pass ttl=0 to use the default 1-hour TTL.
func (c *SemanticCache) Set(ctx context.Context, provider, model, prompt string, response []byte, ttl time.Duration) {
	if ttl == 0 {
		ttl = defaultTTL
	}
	key := buildKey(provider, model, prompt)
	// Fire-and-forget: cache failure must never block the proxy response
	_ = c.client.Set(ctx, key, response, ttl).Err()
}

// Invalidate removes a cached entry.
func (c *SemanticCache) Invalidate(ctx context.Context, provider, model, prompt string) {
	key := buildKey(provider, model, prompt)
	_ = c.client.Del(ctx, key).Err()
}

// Stats returns basic cache statistics from Redis INFO.
func (c *SemanticCache) Stats(ctx context.Context) map[string]string {
	info, err := c.client.Info(ctx, "stats").Result()
	if err != nil {
		return map[string]string{"error": err.Error()}
	}
	stats := map[string]string{}
	for _, line := range strings.Split(info, "\n") {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			if key == "keyspace_hits" || key == "keyspace_misses" {
				stats[key] = val
			}
		}
	}
	return stats
}

// buildKey constructs the Redis key for a given provider+model+prompt tuple.
// Format: aigcm:cache:{provider}:{model}:{sha256(prompt)}
func buildKey(provider, model, prompt string) string {
	hash := sha256.Sum256([]byte(prompt))
	return fmt.Sprintf("%s%s:%s:%x", keyPrefix, provider, model, hash)
}
