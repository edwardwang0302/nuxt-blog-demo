import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SiteFooter from '../../app/components/SiteFooter.vue'

describe('SiteFooter', () => {
  it('渲染通用品牌和 RSS 入口', async () => {
    const wrapper = await mountSuspended(SiteFooter)

    expect(wrapper.text()).toContain('Demo Notes')
    expect(wrapper.find('a[href="/rss.xml"]').exists()).toBe(true)
  })

  it('只保留站内 RSS 链接', async () => {
    const wrapper = await mountSuspended(SiteFooter)

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.find('a[href^="http"]').exists()).toBe(false)
    expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  })
})
