import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders a real button and forwards clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')

    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disables itself and reports busy while loading', () => {
    render(<Button loading>Saving</Button>)

    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('applies the requested variant', () => {
    render(<Button variant="danger">Delete</Button>)

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'bg-danger',
    )
  })
})
