"""Add posts for the Week 1 authenticated feed."""

from alembic import op
import sqlalchemy as sa

revision = "b3080df2fc01"
down_revision = "88fd3dcf3c30"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("body", sa.String(2000), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_posts_created_at_id", "posts", ["created_at", "id"])


def downgrade() -> None:
    op.drop_index("ix_posts_created_at_id", table_name="posts")
    op.drop_table("posts")
