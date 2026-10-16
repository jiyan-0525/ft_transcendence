package main

import (
	"log"

	"github.com/jiyan-0525/ft_transcendence/packages/server/internal/handler"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// Register health route.
	e.GET("/api/health", handler.Health)

	// Start HTTP server.
	log.Println("Starting Pong API on port 3000")

	if err := e.Start(":3000"); err != nil {
		log.Fatal(err)
	}
}
