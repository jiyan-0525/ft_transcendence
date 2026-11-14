import pytest
from pydantic import ValidationError

from app.schemas import LoginRequest, RegisterRequest


@pytest.mark.parametrize(
    "password",
    ["Aa1!aaa", "aa1!aaaa", "AA1!AAAA", "Aa!!aaaa", "Aa11aaaa", "Aa11aaa ", "Aa1!" + "a" * 125],
)
def test_registration_rejects_invalid_passwords(password):
    with pytest.raises(ValidationError) as error:
        RegisterRequest(email="ada@example.com", username="ada", password=password)
    assert error.value.errors()[0]["loc"] == ("password",)


def test_login_accepts_an_existing_password_without_composition_requirements():
    password = "correct horse battery"
    login = LoginRequest(email="ada@example.com", password=password)
    assert login.password.get_secret_value() == password
