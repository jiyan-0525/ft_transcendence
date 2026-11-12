import type { UserResponse } from '@/types/api'
import type { User } from '@/types/models'

/** Convert the snake_case wire shape into the camelCase domain model. */
export function mapUser(dto: UserResponse): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    role: dto.role,
    isActive: dto.is_active,
    createdAt: new Date(dto.created_at),
  }
}
