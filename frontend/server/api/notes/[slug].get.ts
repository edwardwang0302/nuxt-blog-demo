import { loadContent, renderMarkdown, toNoteSummary } from '../../utils/content'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 404, statusMessage: '笔记不存在' })
  }

  const note = loadContent({ contentDir: String(useRuntimeConfig().contentDir) }).find(
    (item) => item.slug === slug,
  )

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: '笔记不存在' })
  }

  return {
    note: {
      ...toNoteSummary(note),
      html: renderMarkdown(note),
    },
  }
})
