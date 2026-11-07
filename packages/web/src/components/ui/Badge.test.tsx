import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge tone="brand">New</Badge>)

    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('carries the tone as a tinted background and a dot', () => {
    const { container } = render(<Badge tone="danger">Overdue</Badge>)

    const badge = screen.getByText('Overdue')
    expect(badge).toHaveClass('bg-danger/10')
    expect(container.querySelector('.bg-danger')).toBeInTheDocument()
  })

  it('can hide the dot', () => {
    const { container } = render(
      <Badge tone="mint" dot={false}>
        Online
      </Badge>,
    )

    expect(container.querySelector('.bg-mint')).toBeNull()
  })
})
