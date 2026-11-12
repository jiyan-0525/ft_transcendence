import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from './Dropdown'

function setup(onSelect = vi.fn()) {
  const items = [
    { label: 'Profile', onSelect },
    { label: 'Settings', onSelect, disabled: true },
    { label: 'Sign out', onSelect, tone: 'danger' as const },
  ]
  render(<Dropdown trigger="Ada" triggerLabel="Account menu" items={items} />)
  return { onSelect, user: userEvent.setup() }
}

describe('Dropdown', () => {
  it('opens on click and focuses the first enabled item', async () => {
    const { user } = setup()

    const trigger = screen.getByRole('button', { name: 'Account menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus()
  })

  it('skips disabled items with the arrow keys', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus()
  })

  it('runs the chosen action, closes and returns focus to the trigger', async () => {
    const { onSelect, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    await user.keyboard('{End}{Enter}')

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveFocus()
  })

  it('closes on Escape and on a click outside', async () => {
    const { user } = setup()
    const trigger = screen.getByRole('button', { name: 'Account menu' })

    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
