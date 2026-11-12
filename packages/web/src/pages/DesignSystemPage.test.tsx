import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      'Avatar',
      'Tabs',
      'Modal',
      'Form field',
      'Empty state',
      'Dropdown',
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

  it('opens the gallery modal and closes it with Escape', async () => {
    const user = userEvent.setup()
    render(<DesignSystemPage />)

    await user.click(screen.getByRole('button', { name: 'Delete post' }))
    expect(screen.getByRole('dialog', { name: 'Delete this post?' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('switches gallery tabs with the keyboard', async () => {
    const user = userEvent.setup()
    render(<DesignSystemPage />)

    await user.click(screen.getByRole('tab', { name: 'Posts' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Friends' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Friends are listed here.')).toBeInTheDocument()
  })
})
