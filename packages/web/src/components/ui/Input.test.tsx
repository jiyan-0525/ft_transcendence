import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from './Input'

describe('Input', () => {
  it('associates the label with the field', () => {
    render(<Input label="Email" placeholder="you@example.com" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('links the hint through aria-describedby', () => {
    render(<Input label="Password" hint="At least 12 characters." />)

    const input = screen.getByLabelText('Password')
    const hint = screen.getByText('At least 12 characters.')

    expect(input).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(hint.id),
    )
  })

  it('marks the field invalid and announces the error', () => {
    render(<Input label="Email" error="This email is already registered." />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('-error'))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This email is already registered.',
    )
  })
})
