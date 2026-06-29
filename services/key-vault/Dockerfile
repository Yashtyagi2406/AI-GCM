FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /key-vault ./cmd/keyvault

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /key-vault /key-vault
EXPOSE 3003
CMD ["/key-vault"]
