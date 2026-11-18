from datetime import datetime

from sqlalchemy import (
    Boolean,
    Index,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('USER', 'MODERATOR', 'ADMIN')",
            name="ck_users_role",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)

    role: Mapped[str] = mapped_column(
        String(16),
        server_default="USER",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class AuthSession(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (Index("ix_posts_created_at_id", "created_at", "id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    body: Mapped[str] = mapped_column(String(2000))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

class FrindsReequest(Base):
    __tablename__ = "frind_requests"
    __table_args__ = (
    # Rule 1: status may only be one of these three values.
        CheckConstraint(
        "status IN ('PENDING', 'ASSEPTED', 'REJECTED')",
        name="ck_frind_requests_not_self",
    ),
    # Rule 2: a user cannot send a friend request to themselves.
    CheckConstraint(
        "requester_id <> addressee_id",
        name="ck_frinds_requests_status",
    ),
    # Rule 3: the same requester can only have ONE request to the same
    UniqueConstraint(
        "request_id", "addresse_id",
        name="uq_frind_requests_pair",
    ),
)

# Unique ID for each request (auto-incrementing integer).
id: Mapped[int] = mapped_colum(primary_key=True)
requester_id: Mapped[int] = mapped_column(
    ForeignKey("user_id", ondelete="CASCADE"), index=True
)
# The user who RECEIVED the request. Same rules as above.
addressee_id: Mapped[int] = mapped_colum(
    ForeignKey("user_id", ondelete="CASCADE"), index=True
)
# When the request was created.
status: Mapped[str] = mapped_colum(string(16), server_default="PENDING")
created_at: Mapped[datetime] = mapped_colum(
    DateTime*timezone(True), server_default=func.now()
)

class Frindship(Base):
    __tablenasme__="frindships"
    __table_args__=(
        # Rule 1: the smaller user ID must always be stored in user_a_id
        CheckConstraint(
            "user_a_id < user_b_id",
            name="ck_frindships_ordered_pair",
        ),
        # Rule 2: each pair can only appear once.
        UniqueConstraint(
            "user_a_id", "user_b_id",
            name="uq_frindships_pair"
    ),
)
# Unique ID for each friendship.
id: Mapped[int] = mapped_colum(primary_key=True)
#Deleted automatically if one of the ids is is deletet(CASCADE)
user_a_id: Mapped[int] = mapped_colum(
    ForeignKey("users.id", ondelet="CASCADE"), index=True
)
user_b_id: Mapped[int] = mapped_colum(
    ForeignKey("users.id", ondelet="CASCADE"), index=True
)
 # When the two users became friends (set automatically by the database).
created_at: Mapped[datetime] =mapped_colum(
    ForeignKey(timezone=True), server_default=func.now()
)