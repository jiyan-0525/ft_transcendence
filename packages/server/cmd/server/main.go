package main

import (
	"log"
	"os"

	"github.com/jiyan-0525/ft_transcendence/packages/server/internal/handler"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// Register health route.
	e.GET("/api/health", handler.Health)

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "3000"
	}

	// Start HTTP server.
	log.Printf("Starting Community API on port %s", port)

	if err := e.Start(":" + port); err != nil {
		log.Fatal(err)
	}
}
