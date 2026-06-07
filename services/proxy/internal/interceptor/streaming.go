package interceptor

import (
	"bufio"
	"io"
	"strings"
)

// StreamingTokenCounter counts tokens from SSE streaming responses chunk by chunk.
type StreamingTokenCounter struct {
	TotalTokens int
	InputTokens int
	OutputTokens int
}

// ProcessSSEStream reads SSE chunks and accumulates token counts.
func (c *StreamingTokenCounter) ProcessSSEStream(r io.Reader, w io.Writer) error {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			chunk := strings.TrimPrefix(line, "data: ")
			c.processChunk(chunk)
			// Forward to client
			_, _ = w.Write([]byte(line + "\n\n"))
		}
	}
	return scanner.Err()
}

func (c *StreamingTokenCounter) processChunk(data string) {
	// Parse JSON chunk and extract token delta
	// Provider-specific parsing happens here
	c.OutputTokens++
}
