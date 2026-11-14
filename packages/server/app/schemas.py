import re
from datetime import datetime
from string import punctuation
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
    StringConstraints,
    field_validator,
)


Username = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_]+$",
    ),
]

# define Pydantic models for request and response schemas
class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr = Field(max_length=254)
    username: Username
    password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: SecretStr) -> SecretStr:
        password = value.get_secret_value()
        if not (
            re.search(r"[A-Z]", password)
            and re.search(r"[a-z]", password)
            and re.search(r"[0-9]", password)
            and any(char in punctuation for char in password)
        ):
            raise ValueError(
                "Use an uppercase letter, a lowercase letter, a number and a special character."
            )
        return value


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr = Field(max_length=254)
    password: SecretStr = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    role: str
    is_active: bool
    created_at: datetime
