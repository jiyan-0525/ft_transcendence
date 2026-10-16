package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

// Using standard library to test health handler
func TestHealth(t *testing.T) {
	// Create Echo instance
	e := echo.New()

	// health request
	req := httptest.NewRequest(
		http.MethodGet,
		"/api/health",
		nil,
	)

	// 3. Create response recorder
	rec := httptest.NewRecorder()

	// 4. Create Echo context
	c := e.NewContext(req, rec)

	// 5. Call Health handler
	if err := Health(c); err != nil {
		t.Fatalf("Health returned an error: %v", err)
	}

	// status code
	if rec.Code != http.StatusOK {
		t.Errorf(
			"expected status 200, got %d",
			rec.Code,
		)
	}

	// Check content type
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
