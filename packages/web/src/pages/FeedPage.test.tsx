import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeedPage from './FeedPage'

describe('FeedPage', () => {
  it('renders the feed heading', () => {
    render(<FeedPage />)

    expect(
      screen.getByRole('heading', { name: /home feed/i }),
    ).toBeInTheDocument()
  })
})
