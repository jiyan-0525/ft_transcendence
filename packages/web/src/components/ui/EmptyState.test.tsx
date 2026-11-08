import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('shows the title, description and action', () => {
    render(
      <EmptyState
        title="No posts yet"
        description="Share something to start the feed."
        action={<button type="button">Write a post</button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'No posts yet' })).toBeInTheDocument()
    expect(screen.getByText('Share something to start the feed.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Write a post' })).toBeInTheDocument()
  })

  it('hides the decorative icon from assistive technology', () => {
    render(<EmptyState title="Nothing here" icon={<span data-testid="icon" />} />)

    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})
