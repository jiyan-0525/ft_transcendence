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
    requester_username: str
    addressee_id: int
    addressee_username: str
    status: str
    created_at: datetime

class FriendRequestList(BaseModel):
    incoming: list[FriendRequestResponse]
    outgoing: list[FriendRequestResponse]

class FriendResponse(BaseModel):
    user_id: int
    username: str
    since: datetime


def request_response(db: DbSession, req: FriendRequest) -> FriendRequestResponse:
    return(FriendRequestResponse(
        id=req.id,
        requester_id=req.requester_id,
        requester_username=db.get(User, req.requester_id).username,
        addressee_id=req.addressee_id,
        addressee_username=db.get(User, req.addressee_id).username,
        status=req.status,
        created_at=req.created_at, 
    ))
def find_request(db: DbSession, request_id: int) -> FriendRequest:
    req = db.get(FriendRequest, request_id, with_for_update=True)
    if req is None:
        raise HTTPException(404, "Friend Request not found.")
    return(req)

def find_friendship(db: DbSession, first_id: int, second_id: int) -> Friendship | None:
    user_a_id, user_b_id = sorted((first_id, second_id))
    return db.scalar(
        select(Friendship).where(
            Friendship.user_a_id == user_a_id,
            Friendship.user_b_id == user_b_id,
        )
    )

@router.post("/requests", status_code=201, dependencies=[Depends(require_trusted_origin)])
def send_request(body: FriendRequestInput, db: DbSession, user: CurrentUser) -> FriendRequestResponse:
    if body.user_id == user.id:
        raise HTTPException(422, "You cannot send a friends request to yourself.")
    if(db.get(User, body.user_id) is None):
        raise HTTPException(404, "User not found.")
    if find_friendship(db, user.id, body.user_id) is not None:
        raise HTTPException(409, "You are already friends.")

    reverse = db.scalar(
        select(FriendRequest).where(
            FriendRequest.requester_id == body.user_id,
            FriendRequest.addressee_id == user.id,
            FriendRequest.status == "PENDING",
        )
    )
    if reverse is not None:
        raise HTTPException(409, "This user has already sent you a request.")

    existing = db.scalar(
        select(FriendRequest).where(FriendRequest.requester_id == user.id, FriendRequest.addressee_id == body.user_id)
    )
    if existing is not None:
        if existing.status != "PENDING":
            existing.status = "PENDING"
            db.commit()
        return request_response(db, existing)
    req = FriendRequest(requester_id=user.id, addressee_id=body.user_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return request_response(db, req)

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
        incoming = [request_response(db, r) for r in incoming],
        outgoing = [request_response(db, r) for r in outgoing],
    )
@router.post("/requests/{request_id}/accept", dependencies=[Depends(require_trusted_origin)])
def accept_request(request_id: int, db: DbSession, user:CurrentUser) -> FriendRequestResponse:
    req = find_request(db, request_id)
    if req.addressee_id != user.id:
        raise HTTPException(403, "Only the recipient can accept this request.")

    if req.status != "PENDING":
        raise HTTPException(409, "This request is no longer active.")
    
    req.status = "ACCEPTED"
    if find_friendship(db, req.requester_id, req.addressee_id) is None:
        user_a_id, user_b_id = sorted((req.requester_id, req.addressee_id))
        db.add(Friendship(user_a_id=user_a_id, user_b_id=user_b_id))
    
    db.commit()
    return(request_response(db, req))

@router.post("/requests/{request_id}/reject", dependencies=[Depends(require_trusted_origin)])
def reject_request(request_id: int, db: DbSession, user: CurrentUser) -> FriendRequestResponse:
    req = find_request(db, request_id)
    if req.addressee_id != user.id:
        raise HTTPException(403, "Only the recipient can reject the request.")
    
    if req.status != "PENDING":
        raise HTTPException(409, "This request is no longer active.")
    req.status = "REJECTED"
    
    db.commit()
    return(request_response(db, req))

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
    friendship = find_friendship(db, user.id, user_id)

    if friendship is None:
        raise HTTPException(404, "Friendship not found.")
    db.delete(friendship)
    db.commit()