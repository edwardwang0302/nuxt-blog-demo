import { fileURLToPath } from 'node:url'

// 首屏前设置 data-theme，避免亮暗主题闪烁；启用 CSP 时需要为内联脚本提供 nonce。
const themeScript = `(() => {
  try {
    const key = 'fieldnotes-theme'
    const stored = window.localStorage.getItem(key)
    const preference =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const dark =
      preference === 'dark' ||
      (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  } catch {
    // 存储不可用时保持默认亮色。
  }
})()`

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-11-10',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  css: [
    '@fontsource-variable/manrope/index.css',
    '@fontsource-variable/noto-sans-sc/index.css',
    '@fontsource-variable/geist-mono/index.css',
    '~/assets/styles/main.scss',
  ],
  runtimeConfig: {
    // 内容目录默认指向仓库根 content；部署时可用 NUXT_CONTENT_DIR 覆盖。
    contentDir: fileURLToPath(new URL('../content', import.meta.url)),
    public: {
      // 部署时用 NUXT_PUBLIC_SITE_URL 覆盖，用于 canonical、Open Graph、RSS 和 sitemap。
      siteUrl: 'http://localhost:3000',
    },
  },
  app: {
    head: {
      title: 'Demo Notes',
      titleTemplate: '%s — Demo Notes',
      htmlAttrs: {
        lang: 'zh-CN',
      },
      meta: [
        {
          name: 'description',
          content: '一个用 Nuxt 4 构建的个人笔记站示例：Markdown 内容管线、标签与系列、亮暗主题。',
        },
        { property: 'og:site_name', content: 'Demo Notes' },
        { property: 'og:locale', content: 'zh_CN' },
      ],
      link: [
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Demo Notes RSS',
          href: '/rss.xml',
        },
      ],
      script: [
        {
          tagPosition: 'head',
          innerHTML: themeScript,
        },
      ],
    },
  },
})
