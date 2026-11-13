from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

ERROR_CODES = {
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    429: "RATE_LIMITED",
}


def error_response(
    status: int, code: str, message: str, headers: dict[str, str] | None = None
) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {"code": code, "message": message, "requestId": uuid4().hex}
        },
        headers={"Cache-Control": "no-store", **(headers or {})},
    )


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        if exc.status_code >= 500:
            return error_response(exc.status_code, "INTERNAL", "Internal server error.")
        message = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return error_response(
            exc.status_code,
            ERROR_CODES.get(exc.status_code, "INVALID_PAYLOAD"),
            message,
            exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Validation input can contain a plaintext password.
        return error_response(422, "INVALID_PAYLOAD", "Check the submitted fields.")

    @app.exception_handler(Exception)
    async def internal_error(request: Request, exc: Exception) -> JSONResponse:
        return error_response(500, "INTERNAL", "Internal server error.")
