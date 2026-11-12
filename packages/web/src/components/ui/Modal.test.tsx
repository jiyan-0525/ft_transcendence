import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Delete post
      </button>
      <Modal
        open={open}
        title="Delete this post?"
        description="This cannot be undone."
        onClose={() => {
          onClose()
          setOpen(false)
        }}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button">Delete</button>
          </>
        }
      >
        <p>Your post will be removed for everyone.</p>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Harness />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens as a labelled modal dialog with focus inside', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Delete post' }))

    const dialog = screen.getByRole('dialog', { name: 'Delete this post?' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })

  it('closes on Escape and returns focus to the opener', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    const opener = screen.getByRole('button', { name: 'Delete post' })
    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Delete post' }))
    const dialog = screen.getByRole('dialog')

    for (let step = 0; step < 6; step++) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('closes when the backdrop is clicked but not when the dialog is', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Delete post' }))
    await user.click(screen.getByText('Your post will be removed for everyone.'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('dialog').parentElement!)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
