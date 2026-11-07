import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Textarea from './Textarea'

describe('Textarea', () => {
  it('associates the label and reports errors', () => {
    render(<Textarea label="Bio" error="Bio is too long." />)

    const field = screen.getByLabelText('Bio')
    expect(field.tagName).toBe('TEXTAREA')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Bio is too long.')
  })
})
