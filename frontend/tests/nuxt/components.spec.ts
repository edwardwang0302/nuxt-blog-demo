import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppContainer from '../../app/components/AppContainer.vue'
import BaseTag from '../../app/components/BaseTag.vue'
import BaseButton from '../../app/components/BaseButton.vue'
import EmptyState from '../../app/components/EmptyState.vue'
import NoteCard from '../../app/components/NoteCard.vue'
import TopicFilter from '../../app/components/TopicFilter.vue'
import DefaultLayout from '../../app/layouts/default.vue'

describe('BaseTag', () => {
  it('渲染标签文字', async () => {
    const wrapper = await mountSuspended(BaseTag, { props: { label: '智能体' } })
    expect(wrapper.text()).toBe('智能体')
  })

  it('默认、选中和进行中状态使用不同样式', async () => {
    const defaultTag = await mountSuspended(BaseTag, { props: { label: '默认' } })
    const selectedTag = await mountSuspended(BaseTag, {
      props: { label: '选中', state: 'selected' },
    })
    const progressTag = await mountSuspended(BaseTag, {
      props: { label: '进行中', state: 'in-progress' },
    })

    expect(selectedTag.classes()).not.toEqual(defaultTag.classes())
    expect(progressTag.classes()).not.toEqual(defaultTag.classes())
  })
})

describe('BaseButton', () => {
  it('默认为 button，type 可覆盖', async () => {
    const button = await mountSuspended(BaseButton, { slots: { default: '按钮' } })
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')

    const submit = await mountSuspended(BaseButton, {
      props: { type: 'submit' },
      slots: { default: '提交' },
    })
    expect(submit.attributes('type')).toBe('submit')
  })

  it('to 渲染为 NuxtLink，href 渲染为普通链接', async () => {
    const routerLink = await mountSuspended(BaseButton, {
      props: { to: '/notes' },
      slots: { default: '笔记' },
    })
    expect(routerLink.element.tagName).toBe('A')
    expect(routerLink.attributes('href')).toBe('/notes')

    const external = await mountSuspended(BaseButton, {
      props: { href: 'https://github.com' },
      slots: { default: 'GitHub' },
    })
    expect(external.element.tagName).toBe('A')
    expect(external.attributes('href')).toBe('https://github.com')
  })

  it('透传 aria 状态', async () => {
    const wrapper = await mountSuspended(BaseButton, {
      props: { to: '/notes' },
      attrs: { 'aria-current': 'page' },
      slots: { default: '当前页' },
    })
    expect(wrapper.attributes('aria-current')).toBe('page')
  })
})

describe('NoteCard', () => {
  it('渲染元信息、标题、摘要和标签', async () => {
    const wrapper = await mountSuspended(NoteCard, {
      props: {
        to: '/notes/rag-loop',
        meta: '实验记录 / 2026.11.03',
        title: '用一个周末验证 RAG 的最小闭环',
        summary: '从 Markdown 到向量检索，再到带引用回答。',
        tags: ['RAG', '实验'],
      },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/notes/rag-loop')
    expect(wrapper.find('h3').text()).toBe('用一个周末验证 RAG 的最小闭环')
    expect(wrapper.text()).toContain('实验记录 / 2026.11.03')
    expect(wrapper.text()).toContain('从 Markdown 到向量检索')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('没有标签时不渲染标签列表', async () => {
    const wrapper = await mountSuspended(NoteCard, {
      props: {
        to: '/notes/plain',
        meta: '工具速览 / 2026.11.01',
        title: '没有标签的笔记',
        summary: '摘要',
      },
    })
    expect(wrapper.find('ul').exists()).toBe(false)
  })
})

describe('TopicFilter', () => {
  it('使用 aria-pressed 表达选中，并在点击时发出 toggle', async () => {
    const wrapper = await mountSuspended(TopicFilter, {
      props: { label: '全部', selected: true },
    })

    expect(wrapper.attributes('aria-pressed')).toBe('true')
    await wrapper.trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})

describe('EmptyState', () => {
  it('渲染说明并在点击动作按钮时发出 action', async () => {
    const wrapper = await mountSuspended(EmptyState, {
      props: {
        eyebrow: '当前筛选 / 0 篇笔记',
        title: '还没有匹配的笔记。',
        description: '试试其他标签。',
        actionLabel: '清除所有筛选',
      },
    })

    expect(wrapper.text()).toContain('还没有匹配的笔记。')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
  })
})

describe('AppContainer', () => {
  it('支持语义标签和内容宽度', async () => {
    const wrapper = await mountSuspended(AppContainer, {
      props: { as: 'section', width: 'content' },
      slots: { default: '<p>内容</p>' },
    })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.text()).toBe('内容')
  })
})

describe('默认布局', () => {
  it('先渲染跳转链接，再渲染页头、主内容区和页脚', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>页面内容</p>' },
    })

    const skipLink = wrapper.find('a[href="#main-content"]')
    expect(skipLink.exists()).toBe(true)
    expect(skipLink.text()).toBe('跳到主要内容')
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)

    const main = wrapper.find('main#main-content')
    expect(main.exists()).toBe(true)
    expect(main.attributes('tabindex')).toBe('-1')
    expect(main.text()).toContain('页面内容')

    const markup = wrapper.html()
    expect(markup.indexOf('跳到主要内容')).toBeLessThan(markup.indexOf('<header'))
    expect(markup.indexOf('<main')).toBeLessThan(markup.indexOf('<footer'))
  })

  it('只包含一个主导航', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: '<p>页面内容</p>' },
    })
    expect(wrapper.find('nav[aria-label="主导航"]').exists()).toBe(true)
  })
})
