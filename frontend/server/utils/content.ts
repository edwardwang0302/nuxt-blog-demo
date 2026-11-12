import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import matter from 'gray-matter'
import { JSON_SCHEMA, load as loadYaml } from 'js-yaml'
import MarkdownIt from 'markdown-it'
import { z } from 'zod'

export const NOTE_TYPES = ['tool', 'repo', 'experiment'] as const
export type NoteType = (typeof NOTE_TYPES)[number]

export const ARTICLE_TYPE = 'article'
export const CONTENT_TYPES = [...NOTE_TYPES, ARTICLE_TYPE] as const
export type ContentType = (typeof CONTENT_TYPES)[number]
export type ContentKind = 'note' | 'article'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i

const isValidDate = (value: string): boolean => {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const frontmatterSchema = z
  .object({
    title: z.string().trim().min(1, '标题不能为空'),
    summary: z.string().trim().min(1, '摘要不能为空'),
    type: z.enum(CONTENT_TYPES, { message: '类型必须是 tool、repo、experiment 或 article' }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须是 YYYY-MM-DD')
      .refine(isValidDate, '日期不是有效日期'),
    tags: z
      .array(z.string().trim().min(1, '标签不能为空'))
      .min(1, '至少需要一个标签')
      .refine((tags) => new Set(tags).size === tags.length, '标签不能重复'),
    series: z.string().trim().min(1, '系列名不能为空').optional(),
    repo: z.string().url('仓库链接必须是有效 URL').optional(),
    website: z.string().url('官网链接必须是有效 URL').optional(),
    draft: z.boolean().optional(),
    /** 仅长文使用；笔记的 slug 由文件名或目录名决定。 */
    slug: z
      .string()
      .regex(SLUG_PATTERN, 'slug 必须是小写 kebab-case，只包含字母、数字和连字符')
      .optional(),
  })
  .strict()

export type NoteFrontmatter = z.infer<typeof frontmatterSchema>

export interface ContentIssue {
  file: string
  message: string
}

export class ContentValidationError extends Error {
  readonly issues: ContentIssue[]

  constructor(issues: ContentIssue[]) {
    super(
      `内容校验失败（${issues.length} 项）：\n${issues
        .map((issue) => `- ${issue.file}: ${issue.message}`)
        .join('\n')}`,
    )
    this.name = 'ContentValidationError'
    this.issues = issues
  }
}

export interface NoteSummary {
  slug: string
  title: string
  summary: string
  type: ContentType
  date: string
  tags: string[]
  series?: string
  repo?: string
  website?: string
}

export interface ContentNote extends NoteSummary {
  /** note 与 article 决定本地资源的目录结构和标签。 */
  kind: ContentKind
  /** 相对 content 目录的路径，用于错误信息和调试。 */
  file: string
  body: string
  draft: boolean
}

export interface TagAggregate {
  name: string
  count: number
}

export interface SeriesAggregate {
  name: string
  count: number
  notes: NoteSummary[]
}

export interface LoadContentOptions {
  /** 仓库根目录下 content 的绝对路径。 */
  contentDir: string
  includeDrafts?: boolean
}

interface NoteCandidate {
  slug: string
  file: string
}

const toRelativeFile = (contentDir: string, file: string): string =>
  relative(contentDir, file).split(sep).join('/')

const byDateDescending = (first: ContentNote, second: ContentNote): number => {
  if (first.date !== second.date) return first.date < second.date ? 1 : -1
  return first.slug.localeCompare(second.slug)
}

const listNoteCandidates = (contentDir: string, issues: ContentIssue[]): NoteCandidate[] => {
  const notesDir = join(contentDir, 'notes')

  if (!existsSync(notesDir)) return []

  const bySlug = new Map<string, string[]>()

  for (const entry of readdirSync(notesDir, { withFileTypes: true })) {
    let slug: string
    let file: string

    if (entry.isFile() && entry.name.endsWith('.md')) {
      slug = entry.name.slice(0, -'.md'.length)
      file = join(notesDir, entry.name)
    } else if (entry.isDirectory()) {
      file = join(notesDir, entry.name, 'index.md')
      if (!existsSync(file)) continue
      slug = entry.name
    } else {
      continue
    }

    const files = bySlug.get(slug) ?? []
    files.push(file)
    bySlug.set(slug, files)
  }

  const candidates: NoteCandidate[] = []

  for (const [slug, files] of bySlug) {
    if (!SLUG_PATTERN.test(slug)) {
      issues.push({
        file: files.map((file) => toRelativeFile(contentDir, file)).join(', '),
        message: `slug "${slug}" 必须是小写 kebab-case，只包含字母、数字和连字符`,
      })
    }

    if (files.length > 1) {
      issues.push({
        file: files.map((file) => toRelativeFile(contentDir, file)).join(', '),
        message: `slug "${slug}" 冲突，同一 slug 只能对应一篇笔记`,
      })
      continue
    }

    candidates.push({ slug, file: files[0]! })
  }

  return candidates
}

interface ParsedFrontmatter {
  data: NoteFrontmatter
  body: string
}

const readFrontmatter = (
  contentDir: string,
  filePath: string,
  issues: ContentIssue[],
): ParsedFrontmatter | undefined => {
  const file = toRelativeFile(contentDir, filePath)
  let source: string

  try {
    source = readFileSync(filePath, 'utf8')
  } catch (error) {
    issues.push({
      file,
      message: `无法读取文件：${error instanceof Error ? error.message : String(error)}`,
    })
    return undefined
  }

  let parsed: matter.GrayMatterFile<string>

  // 默认 YAML schema 会把未加引号的日期解析成 Date，2026-02-30 会悄悄滚成 2026-03-02。
  // 用 JSON_SCHEMA 让日期保持字符串，是否合法交给下面的 Zod 校验。
  try {
    parsed = matter(source, {
      engines: {
        yaml: {
          parse: (input: string) =>
            loadYaml(input, { schema: JSON_SCHEMA }) as Record<string, unknown>,
        },
      },
    })
  } catch (error) {
    issues.push({
      file,
      message: `frontmatter 解析失败：${error instanceof Error ? error.message : String(error)}`,
    })
    return undefined
  }

  const frontmatter = { ...parsed.data }

  const result = frontmatterSchema.safeParse(frontmatter)

  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({
        file,
        message: `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`,
      })
    }
    return undefined
  }

  return { data: result.data, body: parsed.content.trim() }
}

const toContentNote = (
  kind: ContentKind,
  slug: string,
  file: string,
  parsed: ParsedFrontmatter,
): ContentNote => {
  const data = parsed.data

  return {
    kind,
    slug,
    file,
    title: data.title,
    summary: data.summary,
    type: data.type,
    date: data.date,
    tags: data.tags,
    series: data.series,
    repo: data.repo,
    website: data.website,
    draft: data.draft ?? false,
    body: parsed.body,
  }
}

const readNoteCandidate = (
  contentDir: string,
  candidate: NoteCandidate,
  issues: ContentIssue[],
): ContentNote | undefined => {
  const parsed = readFrontmatter(contentDir, candidate.file, issues)

  if (!parsed) return undefined

  const file = toRelativeFile(contentDir, candidate.file)
  let valid = true

  if (parsed.data.type === ARTICLE_TYPE) {
    issues.push({
      file,
      message: '笔记类型必须是 tool、repo 或 experiment；长文请放到 content/articles/',
    })
    valid = false
  }

  if (parsed.data.slug) {
    issues.push({
      file,
      message: '笔记的 slug 由文件名或目录名决定，不要写在 frontmatter 中',
    })
    valid = false
  }

  if (!valid) return undefined

  return toContentNote('note', candidate.slug, file, parsed)
}

interface ArticleCandidate {
  file: string
}

const ARTICLE_INDEX_FILE = '00-目录.md'

const listArticleCandidates = (contentDir: string): ArticleCandidate[] => {
  const articlesDir = join(contentDir, 'articles')

  if (!existsSync(articlesDir)) return []

  const isArticleFile = (name: string): boolean =>
    name.endsWith('.md') && name !== ARTICLE_INDEX_FILE

  const files: string[] = []

  for (const entry of readdirSync(articlesDir, { withFileTypes: true })) {
    if (entry.isFile() && isArticleFile(entry.name)) {
      files.push(join(articlesDir, entry.name))
    } else if (entry.isDirectory()) {
      const seriesDir = join(articlesDir, entry.name)
      for (const child of readdirSync(seriesDir, { withFileTypes: true })) {
        if (child.isFile() && isArticleFile(child.name)) {
          files.push(join(seriesDir, child.name))
        }
      }
    }
  }

  return files.sort().map((file) => ({ file }))
}

const readArticleCandidate = (
  contentDir: string,
  candidate: ArticleCandidate,
  issues: ContentIssue[],
): ContentNote | undefined => {
  const parsed = readFrontmatter(contentDir, candidate.file, issues)

  if (!parsed) return undefined

  const file = toRelativeFile(contentDir, candidate.file)
  let valid = true

  if (parsed.data.type !== ARTICLE_TYPE) {
    issues.push({
      file,
      message: '文章类型必须是 article；笔记请放到 content/notes/',
    })
    valid = false
  }

  if (!parsed.data.slug) {
    issues.push({ file, message: '文章必须在 frontmatter 中提供 slug' })
    valid = false
  }

  if (!valid || !parsed.data.slug) return undefined

  return toContentNote('article', parsed.data.slug, file, parsed)
}

const collectNotes = (contentDir: string, issues: ContentIssue[]): ContentNote[] =>
  listNoteCandidates(contentDir, issues)
    .map((candidate) => readNoteCandidate(contentDir, candidate, issues))
    .filter((note): note is ContentNote => note !== undefined)

const collectArticles = (contentDir: string, issues: ContentIssue[]): ContentNote[] => {
  const articles: ContentNote[] = []
  const bySlug = new Map<string, string>()

  for (const candidate of listArticleCandidates(contentDir)) {
    const article = readArticleCandidate(contentDir, candidate, issues)

    if (!article) continue

    const existing = bySlug.get(article.slug)

    if (existing) {
      issues.push({
        file: `${existing}, ${article.file}`,
        message: `slug "${article.slug}" 冲突，长文 slug 必须唯一`,
      })
      continue
    }

    bySlug.set(article.slug, article.file)
    articles.push(article)
  }

  return articles
}

/**
 * 读取并校验全部笔记，包含草稿。发现任何错误时抛出 ContentValidationError。
 */
export const loadAllNotes = (options: LoadContentOptions): ContentNote[] => {
  const issues: ContentIssue[] = []
  const notes = collectNotes(options.contentDir, issues)

  if (issues.length > 0) throw new ContentValidationError(issues)

  return notes.sort(byDateDescending)
}

/**
 * 读取可发布笔记，默认过滤 draft: true。
 */
export const loadNotes = (options: LoadContentOptions): ContentNote[] => {
  const notes = loadAllNotes(options)

  if (options.includeDrafts) return notes

  return notes.filter((note) => !note.draft)
}

/**
 * 读取笔记与长文，包含草稿。两者共用 slug 空间与列表。
 */
export const loadAllContent = (options: LoadContentOptions): ContentNote[] => {
  const issues: ContentIssue[] = []
  const entries = [
    ...collectNotes(options.contentDir, issues),
    ...collectArticles(options.contentDir, issues),
  ]

  const bySlug = new Map<string, string>()

  for (const entry of entries) {
    const existing = bySlug.get(entry.slug)

    if (existing) {
      issues.push({
        file: `${existing}, ${entry.file}`,
        message: `slug "${entry.slug}" 冲突，笔记和长文共用同一 URL 空间`,
      })
      continue
    }

    bySlug.set(entry.slug, entry.file)
  }

  if (issues.length > 0) throw new ContentValidationError(issues)

  return entries.sort(byDateDescending)
}

/**
 * 读取可发布内容（笔记与长文），默认过滤 draft: true。
 */
export const loadContent = (options: LoadContentOptions): ContentNote[] => {
  const entries = loadAllContent(options)

  if (options.includeDrafts) return entries

  return entries.filter((entry) => !entry.draft)
}

export const toNoteSummary = (note: ContentNote): NoteSummary => ({
  slug: note.slug,
  title: note.title,
  summary: note.summary,
  type: note.type,
  date: note.date,
  tags: note.tags,
  series: note.series,
  repo: note.repo,
  website: note.website,
})

export const filterNotesByTag = (notes: NoteSummary[], tag: string): NoteSummary[] =>
  notes.filter((note) => note.tags.includes(tag))

export const aggregateTags = (notes: NoteSummary[]): TagAggregate[] => {
  const counts = new Map<string, number>()

  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(
      (first, second) =>
        second.count - first.count || first.name.localeCompare(second.name, 'zh-CN'),
    )
}

export const aggregateSeries = (notes: NoteSummary[]): SeriesAggregate[] => {
  const groups = new Map<string, NoteSummary[]>()

  for (const note of notes) {
    if (!note.series) continue

    const group = groups.get(note.series) ?? []
    group.push(note)
    groups.set(note.series, group)
  }

  return [...groups.entries()]
    .map(([name, groupedNotes]) => ({
      name,
      count: groupedNotes.length,
      notes: groupedNotes.sort((first, second) => {
        if (first.date !== second.date) return first.date < second.date ? -1 : 1
        return first.slug.localeCompare(second.slug)
      }),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, 'zh-CN'))
}

/**
 * 把笔记或长文内的相对图片路径改写为可访问的站点路径，外部 URL 原样保留。
 */
export const resolveImageSource = (
  slug: string,
  source: string,
  kind: ContentKind = 'note',
): string => {
  if (ABSOLUTE_URL_PATTERN.test(source)) return source

  const normalized = posix.normalize(source.replace(/^\.\//, ''))

  if (
    normalized.startsWith('..') ||
    normalized.startsWith('/') ||
    normalized.includes('\\') ||
    normalized === '.'
  ) {
    throw new Error(`图片路径不合法：${source}`)
  }

  const section = kind === 'article' ? 'articles' : 'notes'

  return `/content-assets/${section}/${slug}/${normalized
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
})

const defaultImageRenderer =
  markdown.renderer.rules.image ??
  ((tokens, index, options, _environment, self) => self.renderToken(tokens, index, options))

markdown.renderer.rules.image = (tokens, index, options, environment, self) => {
  const token = tokens[index]
  if (!token) return ''

  const source = token.attrGet('src')
  if (source !== null)
    token.attrSet(
      'src',
      resolveImageSource(
        String(environment?.slug ?? ''),
        String(source),
        environment?.kind === 'article' ? 'article' : 'note',
      ),
    )

  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')

  return defaultImageRenderer(tokens, index, options, environment, self)
}

export const renderMarkdown = (
  note: Pick<ContentNote, 'slug' | 'body'> & { kind?: ContentKind },
): string => markdown.render(note.body, { slug: note.slug, kind: note.kind ?? 'note' })
