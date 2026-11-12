import { loadContent } from '../utils/content'

export default defineEventHandler(() => {
  const entries = loadContent({ contentDir: String(useRuntimeConfig().contentDir) })

  return {
    status: 'ok',
    notes: entries.length,
  }
})
