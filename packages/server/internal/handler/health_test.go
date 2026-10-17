package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

// unit test for health handler
func TestHealth(t *testing.T) {
	// Create Echo instance
	e := echo.New()

	// health request
	req := httptest.NewRequest(
		http.MethodGet,
		"/api/health",
		nil,
	)

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	if err := Health(c); err != nil {
		t.Fatalf("Health returned an error: %v", err)
	}

	// check status code
	if rec.Code != http.StatusOK {
		t.Errorf(
			"expected status 200, got %d",
			rec.Code,
		)
	}

	// Check content type / header 
	if got := rec.Header().Get("Content-Type"); got != echo.MIMEApplicationJSON {
		t.Errorf(
			"expected JSON content type, got %q",
			got,
		)
	}

	// Check response body
	expected := `{"service":"pong-api","status":"ok"}`
	if rec.Body.String() != expected+"\n" {
		t.Errorf(
			"expected %q, got %q",
			expected,
			rec.Body.String(),
		)
	}
}
