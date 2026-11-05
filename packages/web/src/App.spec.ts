import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App', () => {
  it('renders the product name and bootstrap message', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Community')
    expect(wrapper.text()).toContain('Frontend foundation')
  })
})
