# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o proxy ./cmd/proxy

# Runtime stage — distroless for minimal attack surface
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/proxy /proxy
EXPOSE 8080
ENTRYPOINT ["/proxy"]
