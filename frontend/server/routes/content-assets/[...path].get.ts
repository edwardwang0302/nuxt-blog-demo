import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { loadContent } from '../../utils/content'

const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const notFound = () => createError({ statusCode: 404, statusMessage: '资源不存在' })

export default defineEventHandler((event) => {
  const rawPath = getRouterParam(event, 'path')

  if (!rawPath) throw notFound()

  let segments: string[]

  try {
    segments = rawPath
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment))
  } catch {
    throw notFound()
  }

  if (segments.length < 3 || (segments[0] !== 'notes' && segments[0] !== 'articles')) {
    throw notFound()
  }

  const section = segments[0]
  const slug = segments[1]!
  const kind = section === 'articles' ? 'article' : 'note'
  const contentDir = String(useRuntimeConfig().contentDir)
  const entry = loadContent({ contentDir }).find((item) => item.slug === slug && item.kind === kind)

  if (!entry) throw notFound()

  const assetDir =
    kind === 'article'
      ? dirname(resolve(contentDir, entry.file))
      : resolve(contentDir, 'notes', slug)
  const assetPath = resolve(assetDir, ...segments.slice(2))

  if (assetPath !== assetDir && !assetPath.startsWith(assetDir + sep)) throw notFound()
  if (!existsSync(assetPath) || !statSync(assetPath).isFile()) throw notFound()

  const contentType = CONTENT_TYPES[extname(assetPath).toLowerCase()]

  if (!contentType) throw notFound()

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(
    event,
    'Cache-Control',
    import.meta.dev ? 'no-cache' : 'public, max-age=31536000, immutable',
  )

  return sendStream(event, createReadStream(assetPath))
})
