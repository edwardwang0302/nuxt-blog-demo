import { expect, test } from '@playwright/test'

// 演示内容：4 篇已发布笔记 + 3 篇已发布长文；另有 1 篇草稿笔记。
// 目录 7 张卡片，首页取最新 6 张。
test('首页展示定位和最新笔记', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: '把动手实验，整理成可读的笔记' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Demo Notes', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /全部笔记/ })).toBeVisible()
  await expect(page.locator('main a[href^="/notes/"]')).toHaveCount(6)
})

test('主题切换使用设计稿文案和图标', async ({ page }) => {
  await page.goto('/')

  const toggle = page.getByRole('button', { name: /切换到\s*暗色/ })
  await expect(toggle).toContainText('暗色')
  await expect(toggle.locator('svg')).toBeVisible()

  await toggle.click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const lightToggle = page.getByRole('button', { name: /切换到\s*浅色/ })
  await expect(lightToggle).toContainText('浅色')
  await expect(lightToggle.locator('svg')).toBeVisible()
})

test('目录按标签筛选并支持清除', async ({ page }) => {
  await page.goto('/notes')

  await expect(page.locator('main li a[href^="/notes/"]')).toHaveCount(7)

  await page.getByRole('button', { name: '工具', exact: true }).click()
  await expect(page).toHaveURL(/tag=/)
  await expect(page.locator('main li a[href^="/notes/"]')).toHaveCount(2)

  await page.getByRole('button', { name: '全部', exact: true }).click()
  await expect(page).toHaveURL(/\/notes$/)
  await expect(page.locator('main li a[href^="/notes/"]')).toHaveCount(7)
})

test('长文出现在系列页并链接到详情', async ({ page }) => {
  await page.goto('/notes/series/demo-log')

  await expect(page.getByRole('heading', { level: 1, name: 'demo-log' })).toBeVisible()
  await expect(page.locator('main li a[href^="/notes/"]')).toHaveCount(3)
  await expect(page.locator('main a[href="/notes/demo-log-01"]')).toHaveCount(1)
  await expect(page.getByText('长文 · 2026-10-20')).toBeVisible()
})

test('未知标签展示空状态', async ({ page }) => {
  await page.goto('/notes?tag=不存在的标签')

  await expect(page.getByRole('heading', { name: '这个标签下还没有笔记' })).toBeVisible()
  await page.getByRole('button', { name: '清除筛选' }).click()
  await expect(page).toHaveURL(/\/notes$/)
})

test('详情页展示正文、本地图片和外链', async ({ page }) => {
  await page.goto('/notes/demo-image')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('本地图片如何进入内容管线')
  await expect(page.getByText('工具 · 2026-11-08')).toBeVisible()
  await expect(page.getByAltText('内容管线示意图：Markdown 经过校验、接口和页面')).toBeVisible()

  await page.goto('/notes/demo-repo')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nuxt 4')
  await expect(page.getByRole('link', { name: '仓库地址 ↗' })).toHaveAttribute(
    'href',
    'https://github.com/nuxt/nuxt',
  )
})

test('草稿不出现在目录且详情返回 404', async ({ page }) => {
  await page.goto('/notes')
  await expect(page.locator('a[href="/notes/demo-draft"]')).toHaveCount(0)

  const response = await page.goto('/notes/demo-draft')
  expect(response?.status()).toBe(404)
  await expect(page.getByText('笔记不存在').first()).toBeVisible()
})

test('接口和订阅只包含已发布内容', async ({ request }) => {
  const notes = await (await request.get('/api/notes')).json()
  expect(notes.notes).toHaveLength(7)
  expect(notes.notes.map((note: { slug: string }) => note.slug)).not.toContain('demo-draft')

  const health = await (await request.get('/api/health')).json()
  expect(health.notes).toBe(7)

  const rss = await (await request.get('/rss.xml')).text()
  expect(rss).toContain('/notes/demo-toolkit')
  expect(rss).not.toContain('demo-draft')

  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/notes/demo-toolkit')
  expect(sitemap).not.toContain('demo-draft')
})

test('不存在的笔记返回 404', async ({ page }) => {
  const response = await page.goto('/notes/does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByText('笔记不存在').first()).toBeVisible()
})
