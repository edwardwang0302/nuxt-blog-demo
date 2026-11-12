import { loadContent } from '../utils/content'
import { escapeXml, getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '../utils/site'

export default defineEventHandler((event) => {
  const siteUrl = getSiteUrl()
  const notes = loadContent({ contentDir: String(useRuntimeConfig().contentDir) })
  const lastBuildDate = new Date().toUTCString()

  const items = notes
    .map((note) => {
      const url = `${siteUrl}/notes/${note.slug}`
      const pubDate = new Date(`${note.date}T00:00:00Z`).toUTCString()

      return [
        '    <item>',
        `      <title>${escapeXml(note.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(note.summary)}</description>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(SITE_NAME)}</title>`,
    `    <link>${escapeXml(`${siteUrl}/`)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    '    <language>zh-CN</language>',
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
})
