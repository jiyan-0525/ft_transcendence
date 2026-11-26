from datetime   import datetime
from typing     import Annotated
from fastapi    import APIRouter, Depends, HTTPException
from pydantic   import BaseModel, ConfigDict
from sqlalchemy import select

from app.auth       import DbSession, get_current_user, require_trusted_origin
from app.friends    import find_friendship
from app.models     import Conversation, ConversationMember, User

router = APIRouter(prefix="/api/conversations", tags=["chat"])
CurrentUser = Annotated[User, Depends(get_current_user)]

class ConversationInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    user_id: int

class ConversationResponse(BaseModel):
    id: int
    other_user_id: int
    other_username: str
    created_at: datetime


def find_conversation(db: DbSession, first_id: int, second_id: int) -> Conversation | None:
    mine = select(ConversationMember.conversation_id).where(ConversationMember.user_id == first_id)
    conversation_id = db.scalar(
        select(ConversationMember.conversation_id).where(ConversationMember.user_id == second_id, ConversationMember.conversation_id.in_(mine),
        )
    )
    if conversation_id is None:
        return(None)
    return (db.get(Conversation, conversation_id))

@router.post("", status_code = 201, dependencies = [Depends(require_trusted_origin)])
def start_conversation(body: ConversationInput, db: DbSession, user: CurrentUser) -> ConversationResponse:
    if body.user_id == user.id:
        raise HTTPException(422, "You can't chat with yourself.")
    other = db.get(User, body.user_id)
    if other is None:
        raise HTTPException(404, "User not found.")
    friendship = find_friendship(db, user.id, body.user_id)
    if friendship is None:
        raise HTTPException(403, "You can only chat with friends.")
    db.refresh(friendship, with_for_update=True)

    conv = find_conversation(db, user.id, body.user_id)
    if conv is None:
        conv = Conversation()
        db.add(conv)
        db.flush()
        db.add_all([
            ConversationMember(conversation_id = conv.id, user_id = user.id),
            ConversationMember(conversation_id = conv.id, user_id = body.user_id)
        ])
        db.commit()
        db.refresh(conv)
    return(ConversationResponse(id = conv.id, other_user_id = other.id, other_username = other.username, created_at = conv.created_at,))