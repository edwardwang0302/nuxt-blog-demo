export const SITE_NAME = 'Demo Notes'
export const SITE_DESCRIPTION =
  '一个用 Nuxt 4 构建的个人笔记站示例：Markdown 内容管线、标签与系列、亮暗主题。'

export const getSiteUrl = (): string =>
  String(useRuntimeConfig().public.siteUrl).replace(/\/+$/, '')

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

export const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => XML_ENTITIES[character]!)
