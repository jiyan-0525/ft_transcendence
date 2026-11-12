import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tabs, { TabPanel } from './Tabs'

const items = [
  { value: 'posts', label: 'Posts' },
  { value: 'friends', label: 'Friends' },
  { value: 'photos', label: 'Photos' },
]

function Harness() {
  const [value, setValue] = useState('posts')
  return (
    <Tabs items={items} value={value} onChange={setValue} label="Profile sections">
      <TabPanel value="posts">Your posts</TabPanel>
      <TabPanel value="friends">Your friends</TabPanel>
      <TabPanel value="photos">Your photos</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('marks the selected tab and renders only its panel', () => {
    render(<Harness />)

    expect(screen.getByRole('tab', { name: 'Posts' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Your posts')
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  })

  it('moves selection with the arrow keys and wraps around', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('tab', { name: 'Posts' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Your friends')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Your photos')
  })

  it('jumps to the first and last tab with Home and End', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('tab', { name: 'Posts' }))
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Photos' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Posts' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('keeps only the selected tab in the tab order', () => {
    render(<Harness />)

    expect(screen.getByRole('tab', { name: 'Posts' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Friends' })).toHaveAttribute('tabindex', '-1')
  })
})
