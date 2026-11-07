import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeedPage from './FeedPage'

describe('FeedPage', () => {
  it('renders the feed hero heading', () => {
    render(<FeedPage />)

    expect(
      screen.getByRole('heading', { name: /your community, in one place/i }),
    ).toBeInTheDocument()
  })

  it('shows the honest empty state instead of preview posts', () => {
    render(<FeedPage />)

    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
  })
})
