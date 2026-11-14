from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import select

from app.auth import DbSession, get_current_user, require_trusted_origin
from app.models import Post, User
from app.permissions import require_owner, require_role

router = APIRouter(prefix="/api/posts", tags=["posts"])
CurrentUser = Annotated[User, Depends(get_current_user)]
PostBody = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]


class PostInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    body: PostBody


class PostResponse(BaseModel):
    id: int
    author_id: int
    author_username: str
    body: str
    created_at: datetime


def post_response(post: Post, username: str) -> PostResponse:
    return PostResponse(
        id=post.id, author_id=post.author_id, author_username=username,
        body=post.body, created_at=post.created_at,
    )


def find_post(db: DbSession, post_id: int) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(404, "Post not found.")
    return post


@router.get("")
def list_posts(
    db: DbSession,
    user: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=100)] = 30,
) -> list[PostResponse]:
    rows = db.execute(
        select(Post, User.username)
        .join(User, Post.author_id == User.id)
        .order_by(Post.created_at.desc(), Post.id.desc())
        .limit(limit)
    )
    return [post_response(post, username) for post, username in rows]


@router.post("", status_code=201, dependencies=[Depends(require_trusted_origin)])
def create_post(body: PostInput, db: DbSession, user: CurrentUser) -> PostResponse:
    post = Post(author_id=user.id, body=body.body)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post_response(post, user.username)


@router.patch("/{post_id}", dependencies=[Depends(require_trusted_origin)])
def update_post(post_id: int, body: PostInput, db: DbSession, user: CurrentUser) -> PostResponse:
    post = find_post(db, post_id)
    require_owner(user, post.author_id)
    post.body = body.body
    db.commit()
    return post_response(post, user.username)


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_trusted_origin)])
def delete_post(post_id: int, db: DbSession, user: CurrentUser) -> None:
    post = find_post(db, post_id)
    if user.id != post.author_id:
        require_role(user, "MODERATOR", "ADMIN")
    db.delete(post)
    db.commit()
