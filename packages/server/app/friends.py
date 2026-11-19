from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select

from app.auth import DbSession, get_current_user, require_trusted_origin
from app.models import FriendRequest, Friendship, User

router = APIRouter(prefix="/api/friends", tags=["friends"])
CurrentUser = Annotated[User, Depends(get_current_user)]

class FriendRequestInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: int

class FriendRequestResponse(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    created_at: datetime

def request_response(req: FriendRequest) -> FriendRequestResponse:
    return(FriendRequestResponse(
        id=req.id, requester_id=req.requester_id, addressee_id=req.addressee_id,
        status=req.status, created_at=req.created_at, 
    ))
@router.post("/requests", status_code=201, dependencies=[Depends(require_trusted_origin)])
def send_request(body: FriendRequestInput, db: DbSession, user: CurrentUser) -> FriendRequestResponse:
    if body.user_id == user.id:
        raise HTTPException(422, "You cannot send a friends request to yourself.")
    if(db.get(User, body.user_id) is None):
        raise HTTPException(404, "User not found.")
    existing = db.scalar(
        select(FriendRequest).where(FriendRequest.requester_id == user.id, FriendRequest.addressee_id == body.user_id)
    )
    if existing is not None:
        return request_response(existing)
    req = FriendRequest(requester_id=user.id, addressee_id=body.user_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return request_response(req)