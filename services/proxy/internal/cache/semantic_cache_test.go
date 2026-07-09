package cache_test

import (
	"context"
	"testing"

	"github.com/ai-gcm/proxy/internal/cache"
	"github.com/redis/go-redis/v9"
)

// buildKey is accessible indirectly through Get/Set behaviour.
// We test the cache logic using a real Redis client pointed at localhost,
// or skip gracefully when Redis is not available.

func redisClient(t *testing.T) *redis.Client {
	t.Helper()
	client := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skipf("Redis not available (%v) — skipping cache tests", err)
	}
	t.Cleanup(func() { client.Close() })
	return client
}

func TestSemanticCacheGetMiss(t *testing.T) {
	c := cache.NewSemanticCache(redisClient(t))
	ctx := context.Background()

	_, hit := c.Get(ctx, "openai", "gpt-4o", "test prompt that should not exist")
	if hit {
		t.Fatal("expected cache miss, got hit")
	}
}

func TestSemanticCacheSetAndGet(t *testing.T) {
	client := redisClient(t)
	c := cache.NewSemanticCache(client)
	ctx := context.Background()

	provider := "openai"
	model    := "gpt-4o"
	prompt   := "what is the capital of France?"
	response := []byte(`{"choices":[{"message":{"content":"Paris"}}]}`)

	c.Set(ctx, provider, model, prompt, response, 0)

	got, hit := c.Get(ctx, provider, model, prompt)
	if !hit {
		t.Fatal("expected cache hit after Set")
	}
	if string(got) != string(response) {
		t.Fatalf("cached value mismatch: got %q, want %q", got, response)
	}

	// Clean up
	c.Invalidate(ctx, provider, model, prompt)
}

func TestSemanticCacheInvalidate(t *testing.T) {
	client := redisClient(t)
	c := cache.NewSemanticCache(client)
	ctx := context.Background()

	provider := "anthropic"
	model    := "claude-3-5-haiku-20241022"
	prompt   := "unique invalidation test prompt"

	c.Set(ctx, provider, model, prompt, []byte("some response"), 0)
	c.Invalidate(ctx, provider, model, prompt)

	_, hit := c.Get(ctx, provider, model, prompt)
	if hit {
		t.Fatal("expected cache miss after Invalidate")
	}
}

func TestSemanticCacheKeyIsolation(t *testing.T) {
	client := redisClient(t)
	c := cache.NewSemanticCache(client)
	ctx := context.Background()

	c.Set(ctx, "openai", "gpt-4o", "same prompt", []byte("openai response"), 0)
	c.Set(ctx, "anthropic", "claude-3-5-sonnet-20241022", "same prompt", []byte("anthropic response"), 0)

	got1, _ := c.Get(ctx, "openai", "gpt-4o", "same prompt")
	got2, _ := c.Get(ctx, "anthropic", "claude-3-5-sonnet-20241022", "same prompt")

	if string(got1) == string(got2) {
		t.Fatal("different providers should produce different cache keys")
	}

	c.Invalidate(ctx, "openai", "gpt-4o", "same prompt")
	c.Invalidate(ctx, "anthropic", "claude-3-5-sonnet-20241022", "same prompt")
}
