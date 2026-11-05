from app.security import hash_password, verify_password


def test_correct_password():
    password_hash = hash_password("Example-password-123!")

    assert password_hash.startswith("$argon2id$")
    assert verify_password("Example-password-123!", password_hash)


def test_wrong_password():
    password_hash = hash_password("Example-password-123!")

    assert not verify_password("Wrong-password", password_hash)


def test_same_password_produces_different_hashes():
    first_hash = hash_password("Example-password-123!")
    second_hash = hash_password("Example-password-123!")

    assert first_hash != second_hash
    assert verify_password("Example-password-123!", first_hash)
    assert verify_password("Example-password-123!", second_hash)