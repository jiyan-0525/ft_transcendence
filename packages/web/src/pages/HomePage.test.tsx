import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders the product heading', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: /one account, one community/i }),
    ).toBeInTheDocument()
  })
})
