package handler

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

// GET /api/health 
func Health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "pong-api",
	})
}
