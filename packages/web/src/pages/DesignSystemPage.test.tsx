import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DesignSystemPage from './DesignSystemPage'

describe('DesignSystemPage', () => {
  it('shows every reusable component in the gallery', () => {
    render(<DesignSystemPage />)

    for (const name of [
      'Button',
      'Badge',
      'Form fields',
      'Feedback',
      'Card',
      'Card variants',
    ]) {
      expect(screen.getByRole('heading', { name, level: 3 })).toBeInTheDocument()
    }
  })

  it('renders the component states: sizes, disabled, invalid and muted', () => {
    render(<DesignSystemPage />)

    expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Full width' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeDisabled()
    expect(screen.getByLabelText('Signature')).toHaveAttribute('aria-invalid', 'true')
  })
})
