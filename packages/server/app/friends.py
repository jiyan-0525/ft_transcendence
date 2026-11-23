from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, or_

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

class FriendRequestList(BaseModel):
    incoming: list[FriendRequestResponse]
    outgoing: list[FriendRequestResponse]

class FriendResponse(BaseModel):
    user_id: int
    username: str
    since: datetime


def request_response(req: FriendRequest) -> FriendRequestResponse:
    return(FriendRequestResponse(
        id=req.id, requester_id=req.requester_id, addressee_id=req.addressee_id,
        status=req.status, created_at=req.created_at, 
    ))
def find_request(db: DbSession, request_id: int) -> FriendRequest:
    req = db.get(FriendRequest, request_id, with_for_update=True)
    if req is None:
        raise HTTPException(404, "Friend Request not found.")
    return(req)

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

@router.get("/requests")
def list_requests(db: DbSession, user: CurrentUser) -> FriendRequestList:
    incoming = db.scalars(
        select(FriendRequest).where(FriendRequest.addressee_id == user.id, FriendRequest.status == "PENDING")
        .order_by(FriendRequest.created_at.desc())
    )
    outgoing = db.scalars(
        select(FriendRequest).where(FriendRequest.requester_id == user.id, FriendRequest.status == "PENDING").
        order_by(FriendRequest.created_at.desc())
    )
    
    return FriendRequestList(
        incoming = [request_response(r) for r in incoming],
        outgoing = [request_response(r) for r in outgoing],
    )
@router.post("/requests/{request_id}/accept", dependencies=[Depends(require_trusted_origin)])
def accept_request(request_id: int, db: DbSession, user:CurrentUser) -> FriendRequestResponse:
    req = find_request(db, request_id)
    if req.addressee_id != user.id:
        raise HTTPException(403, "Only the recipient can accept this request.")

    if req.status != "PENDING":
        raise HTTPException(409, "This request is no longer active.")
    
    req.status = "ACCEPTED"
    user_a_id, user_b_id = sorted((req.requester_id, req.addressee_id))
    already = db.scalar(
        select(Friendship).where(Friendship.user_a_id == user_a_id, Friendship.user_b_id == user_b_id,)
        
    )
    if already is None:
        db.add(Friendship(user_a_id=user_a_id, user_b_id=user_b_id))
    
    db.commit()
    return(request_response(req))

@router.post("/requests/{request_id}/reject", dependencies=[Depends(require_trusted_origin)])
def reject_request(request_id: int, db: DbSession, user: CurrentUser) -> FriendRequestResponse:
    req = find_request(db, request_id)
    if req.addressee_id != user.id:
        raise HTTPException(403, "Only the recipient can reject the request.")
    
    if req.status != "PENDING":
        raise HTTPException(409, "This request is no longer active.")
    req.status = "REJECTED"
    
    db.commit()
    return(request_response(req))

@router.get("")
def list_friends(user: CurrentUser, db: DbSession) -> list[FriendResponse]:
    friendships = db.scalars(select(Friendship).where(
        or_(Friendship.user_a_id == user.id, Friendship.user_b_id == user.id)
    ))
    result = []
    for f in friendships:
        other_id = f.user_b_id if f.user_a_id == user.id else f.user_a_id
        other = db.get(User, other_id)
        result.append(FriendResponse(
            user_id = other.id,
            username = other.username,
            since=f.created_at,
        ))
    return(result)


@router.delete("/{user_id}", status_code = 204, dependencies=[Depends(require_trusted_origin)])
def delete_friend(user_id: int, db: DbSession, user: CurrentUser) -> None:
    user_a_id, user_b_id = sorted((user.id, user_id))
    friendship  = db.scalar(select(Friendship).where(
        Friendship.user_a_id == user_a_id,
        Friendship.user_b_id == user_b_id,
        )
    )

    if friendship is None:
        raise HTTPException(404, "Friendship not found.")
    db.delete(friendship)
    db.commit()