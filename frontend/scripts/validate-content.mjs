import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ContentValidationError, loadAllContent } from '../server/utils/content.ts'

const contentDir = process.env.CONTENT_DIR
  ? resolve(process.env.CONTENT_DIR)
  : fileURLToPath(new URL('../../content', import.meta.url))

try {
  const entries = loadAllContent({ contentDir })
  const drafts = entries.filter((entry) => entry.draft).length
  console.log(`内容校验通过：${entries.length} 篇内容，其中 ${drafts} 篇草稿。`)
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error(error.message)
  } else {
    console.error(error)
  }
  process.exitCode = 1
}
