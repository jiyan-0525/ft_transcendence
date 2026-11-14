from fastapi import HTTPException

from app.models import User


def require_role(user: User, *roles: str) -> None:
    if user.role not in roles:
        raise HTTPException(403, "You do not have permission for this action.")


def require_owner(user: User, owner_id: int) -> None:
    if user.id != owner_id:
        raise HTTPException(403, "Only the owner can perform this action.")
