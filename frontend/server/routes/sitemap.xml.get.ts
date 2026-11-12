import { loadContent } from '../utils/content'
import { escapeXml, getSiteUrl } from '../utils/site'

export default defineEventHandler((event) => {
  const siteUrl = getSiteUrl()
  const notes = loadContent({ contentDir: String(useRuntimeConfig().contentDir) })

  const urls = [
    { loc: `${siteUrl}/`, lastmod: undefined as string | undefined },
    { loc: `${siteUrl}/notes`, lastmod: notes[0]?.date },
    { loc: `${siteUrl}/about`, lastmod: undefined as string | undefined },
    ...notes.map((note) => ({ loc: `${siteUrl}/notes/${note.slug}`, lastmod: note.date })),
  ]

  const entries = urls
    .map(({ loc, lastmod }) =>
      [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        '  </url>',
      ].join('\n'),
    )
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n')
})
