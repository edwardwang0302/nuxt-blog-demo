// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { afterEach, describe, expect, it } from 'vitest'
import {
  ContentValidationError,
  aggregateSeries,
  aggregateTags,
  filterNotesByTag,
  loadAllContent,
  loadAllNotes,
  loadContent,
  loadNotes,
  renderMarkdown,
  resolveImageSource,
  toNoteSummary,
} from '../../server/utils/content'

const temporaryDirs: string[] = []

const createContentDir = (): string => {
  const root = mkdtempSync(join(tmpdir(), 'fieldnotes-content-'))
  mkdirSync(join(root, 'notes'), { recursive: true })
  temporaryDirs.push(root)
  return root
}

const note = (overrides: Record<string, unknown> = {}) => ({
  title: '一篇笔记',
  summary: '一句话结论',
  type: 'tool',
  date: '2026-11-08',
  tags: ['AI'],
  ...overrides,
})

const writeNote = (
  root: string,
  file: string,
  frontmatter: Record<string, unknown>,
  body = '正文内容。',
) => {
  const path = join(root, 'notes', file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, matter.stringify(body, frontmatter))
}

const article = (overrides: Record<string, unknown> = {}) => ({
  title: '一篇长文',
  summary: '长文摘要',
  type: 'article',
  slug: 'demo-log-01',
  date: '2026-11-10',
  tags: ['构建日志'],
  series: 'demo-log',
  ...overrides,
})

const writeArticle = (
  root: string,
  file: string,
  frontmatter: Record<string, unknown>,
  body = '长文正文。',
) => {
  const path = join(root, 'articles', file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, matter.stringify(body, frontmatter))
}

const captureValidationError = (action: () => unknown): ContentValidationError => {
  try {
    action()
  } catch (error) {
    expect(error).toBeInstanceOf(ContentValidationError)
    return error as ContentValidationError
  }
  throw new Error('预期内容校验失败，但没有抛出错误')
}

afterEach(() => {
  while (temporaryDirs.length > 0) {
    rmSync(temporaryDirs.pop()!, { recursive: true, force: true })
  }
})

describe('笔记加载', () => {
  it('支持单文件与目录形式，按日期倒序', () => {
    const root = createContentDir()
    writeNote(root, 'older.md', note({ title: '旧笔记', date: '2026-11-01' }))
    writeNote(root, 'newer/index.md', note({ title: '新笔记', date: '2026-11-05' }))

    const notes = loadNotes({ contentDir: root })

    expect(notes.map((item) => item.slug)).toEqual(['newer', 'older'])
    expect(notes[0]!.file).toBe('notes/newer/index.md')
    expect(notes[0]!.body).toBe('正文内容。')
  })

  it('接受 YAML 未加引号的日期', () => {
    const root = createContentDir()
    writeFileSync(
      join(root, 'notes', 'unquoted.md'),
      [
        '---',
        'title: 未加引号的日期',
        'summary: 摘要',
        'type: tool',
        'date: 2026-11-08',
        'tags:',
        '  - AI',
        '---',
        '',
        '正文。',
        '',
      ].join('\n'),
    )

    expect(loadNotes({ contentDir: root })[0]!.date).toBe('2026-11-08')
  })

  it('缺少目录时返回空列表', () => {
    const root = mkdtempSync(join(tmpdir(), 'fieldnotes-empty-'))
    temporaryDirs.push(root)

    expect(loadNotes({ contentDir: root })).toEqual([])
  })

  it('摘要不包含正文和草稿字段', () => {
    const root = createContentDir()
    writeNote(root, 'sample.md', note({ series: 'demo-log', draft: false }))

    const summary = toNoteSummary(loadNotes({ contentDir: root })[0]!)

    expect(summary).toEqual({
      slug: 'sample',
      title: '一篇笔记',
      summary: '一句话结论',
      type: 'tool',
      date: '2026-11-08',
      tags: ['AI'],
      series: 'demo-log',
      repo: undefined,
      website: undefined,
    })
    expect(summary).not.toHaveProperty('body')
    expect(summary).not.toHaveProperty('draft')
  })
})

describe('内容校验', () => {
  it('收集缺失字段、非法类型和日期错误，并指出文件路径', () => {
    const root = createContentDir()
    writeNote(root, 'broken.md', {
      title: '',
      summary: '摘要',
      type: 'blog',
      date: '2026-13-40',
      tags: [],
    })

    const error = captureValidationError(() => loadNotes({ contentDir: root }))

    expect(error.issues.some((issue) => issue.file === 'notes/broken.md')).toBe(true)
    expect(error.message).toContain('notes/broken.md')
    expect(error.message).toContain('title')
    expect(error.message).toContain('type')
    expect(error.message).toContain('date')
    expect(error.message).toContain('tags')
  })

  it('拒绝不存在的日历日期', () => {
    const root = createContentDir()
    writeNote(root, 'february.md', note({ date: '2026-02-30' }))

    const error = captureValidationError(() => loadNotes({ contentDir: root }))
    expect(error.message).toContain('日期不是有效日期')
  })

  it('拒绝未加引号的非法日期，避免 YAML 把日期滚成另一天', () => {
    const root = createContentDir()
    writeFileSync(
      join(root, 'notes', 'rolled-date.md'),
      [
        '---',
        'title: 未加引号的非法日期',
        'summary: 摘要',
        'type: tool',
        'date: 2026-02-30',
        'tags:',
        '  - AI',
        '---',
        '',
        '正文。',
        '',
      ].join('\n'),
    )

    const error = captureValidationError(() => loadNotes({ contentDir: root }))
    expect(error.message).toContain('日期不是有效日期')
  })

  it('拒绝重复标签和未声明的字段', () => {
    const root = createContentDir()
    writeNote(root, 'duplicate-tags.md', note({ tags: ['AI', 'AI'] }))
    writeNote(root, 'unknown-field.md', note({ category: 'extra' }))

    const error = captureValidationError(() => loadNotes({ contentDir: root }))

    expect(error.message).toContain('标签不能重复')
    expect(error.message).toContain('category')
  })

  it('拒绝非 kebab-case 的 slug', () => {
    const root = createContentDir()
    writeNote(root, 'Bad Slug.md', note())

    const error = captureValidationError(() => loadNotes({ contentDir: root }))
    expect(error.message).toContain('小写 kebab-case')
  })

  it('拒绝重复 slug 并列出冲突文件', () => {
    const root = createContentDir()
    writeNote(root, 'same.md', note())
    writeNote(root, 'same/index.md', note())

    const error = captureValidationError(() => loadNotes({ contentDir: root }))

    expect(error.message).toContain('slug "same" 冲突')
    expect(error.message).toContain('notes/same.md')
    expect(error.message).toContain('notes/same/index.md')
  })

  it('拒绝非法的 repo 和 website 链接', () => {
    const root = createContentDir()
    writeNote(root, 'links.md', note({ repo: 'not-a-url', website: 'also wrong' }))

    const error = captureValidationError(() => loadNotes({ contentDir: root }))
    expect(error.message).toContain('repo')
    expect(error.message).toContain('website')
  })

  it('一次报告多个文件的错误', () => {
    const root = createContentDir()
    writeNote(root, 'first.md', note({ type: 'unknown' }))
    writeNote(root, 'second.md', note({ date: '11/08/2026' }))

    const error = captureValidationError(() => loadNotes({ contentDir: root }))
    expect(error.issues.filter((issue) => issue.file === 'notes/first.md').length).toBeGreaterThan(
      0,
    )
    expect(error.issues.filter((issue) => issue.file === 'notes/second.md').length).toBeGreaterThan(
      0,
    )
  })
})

describe('草稿过滤', () => {
  it('默认排除草稿，校验时仍包含草稿', () => {
    const root = createContentDir()
    writeNote(root, 'published.md', note({ date: '2026-11-01' }))
    writeNote(root, 'draft.md', note({ date: '2026-11-09', draft: true }))

    expect(loadNotes({ contentDir: root }).map((item) => item.slug)).toEqual(['published'])
    expect(loadAllNotes({ contentDir: root }).map((item) => item.slug)).toEqual([
      'draft',
      'published',
    ])
    expect(loadNotes({ contentDir: root, includeDrafts: true }).map((item) => item.slug)).toEqual([
      'draft',
      'published',
    ])
  })
})

describe('长文加载', () => {
  it('与笔记合并排序，默认排除草稿，校验时包含草稿', () => {
    const root = createContentDir()
    writeNote(root, 'note.md', note({ date: '2026-11-08' }))
    writeArticle(root, 'demo-log/01.md', article())
    writeArticle(
      root,
      'demo-log/02.md',
      article({ slug: 'demo-log-02', date: '2026-11-09', draft: true }),
    )

    expect(loadContent({ contentDir: root }).map((entry) => entry.slug)).toEqual([
      'demo-log-01',
      'note',
    ])
    expect(loadAllContent({ contentDir: root }).map((entry) => entry.slug)).toEqual([
      'demo-log-01',
      'demo-log-02',
      'note',
    ])
    expect(loadAllContent({ contentDir: root }).map((entry) => entry.kind)).toEqual([
      'article',
      'article',
      'note',
    ])
  })

  it('忽略文章目录索引文件', () => {
    const root = createContentDir()
    writeArticle(root, 'demo-log/00-目录.md', { title: '目录' })

    expect(loadContent({ contentDir: root })).toEqual([])
  })

  it('要求文章提供 slug 且类型为 article', () => {
    const root = createContentDir()
    writeArticle(root, 'demo-log/no-slug.md', {
      title: '缺少 slug',
      summary: '摘要',
      type: 'article',
      date: '2026-11-10',
      tags: ['构建日志'],
    })
    writeArticle(root, 'demo-log/wrong-type.md', article({ type: 'tool' }))

    const error = captureValidationError(() => loadContent({ contentDir: root }))

    expect(error.message).toContain('文章必须在 frontmatter 中提供 slug')
    expect(error.message).toContain('文章类型必须是 article')
  })

  it('笔记不接受 slug 字段和 article 类型', () => {
    const root = createContentDir()
    writeNote(root, 'with-slug.md', note({ slug: 'custom-slug' }))
    writeNote(root, 'as-article.md', note({ type: 'article' }))

    const error = captureValidationError(() => loadNotes({ contentDir: root }))

    expect(error.message).toContain('笔记的 slug 由文件名或目录名决定')
    expect(error.message).toContain('笔记类型必须是 tool、repo 或 experiment')
  })

  it('笔记和长文不能共用 slug', () => {
    const root = createContentDir()
    writeNote(root, 'demo-log-01.md', note())
    writeArticle(root, 'demo-log/01.md', article())

    const error = captureValidationError(() => loadContent({ contentDir: root }))

    expect(error.message).toContain('slug "demo-log-01" 冲突')
    expect(error.message).toContain('笔记和长文共用同一 URL 空间')
  })
})

describe('标签与系列聚合', () => {
  const notes = [
    {
      slug: 'rag-loop',
      title: 'RAG 闭环',
      summary: '摘要',
      type: 'experiment' as const,
      date: '2026-11-03',
      tags: ['RAG', '实验'],
    },
    {
      slug: 'dspy',
      title: 'DSPy',
      summary: '摘要',
      type: 'repo' as const,
      date: '2026-11-06',
      tags: ['提示工程'],
      series: 'demo-log',
    },
    {
      slug: 'pydantic-ai',
      title: 'Pydantic AI',
      summary: '摘要',
      type: 'tool' as const,
      date: '2026-11-08',
      tags: ['智能体', 'Python'],
      series: 'demo-log',
    },
  ]

  it('按出现次数聚合标签，并支持精确筛选', () => {
    const tags = aggregateTags(notes)

    expect(Object.fromEntries(tags.map((tag) => [tag.name, tag.count]))).toEqual({
      RAG: 1,
      Python: 1,
      实验: 1,
      提示工程: 1,
      智能体: 1,
    })
    expect(tags).toHaveLength(5)
    expect(tags.every((tag, index) => index === 0 || tags[index - 1]!.count >= tag.count)).toBe(
      true,
    )
    expect(filterNotesByTag(notes, 'RAG').map((item) => item.slug)).toEqual(['rag-loop'])
    expect(filterNotesByTag(notes, '不存在')).toEqual([])
  })

  it('系列内按日期升序，系列按名称排序', () => {
    const series = aggregateSeries(notes)

    expect(series).toHaveLength(1)
    expect(series[0]!.name).toBe('demo-log')
    expect(series[0]!.count).toBe(2)
    expect(series[0]!.notes.map((item) => item.slug)).toEqual(['dspy', 'pydantic-ai'])
  })
})

describe('构建前校验脚本', () => {
  const frontendDir = fileURLToPath(new URL('../..', import.meta.url))

  const runValidation = (contentDir: string) =>
    spawnSync(process.execPath, ['scripts/validate-content.mjs'], {
      cwd: frontendDir,
      env: { ...process.env, CONTENT_DIR: contentDir },
      encoding: 'utf8',
    })

  it('有效内容返回 0 并输出统计', () => {
    const root = createContentDir()
    writeNote(root, 'valid.md', note())

    const result = runValidation(root)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('内容校验通过：1 篇内容')
  })

  it('无效内容返回非零退出码并指出文件', () => {
    const root = createContentDir()
    writeNote(root, 'broken.md', note({ type: 'unknown' }))

    const result = runValidation(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('内容校验失败')
    expect(result.stderr).toContain('notes/broken.md')
  })
})

describe('本地图片', () => {
  it('把相对路径改写为内容资源地址', () => {
    expect(resolveImageSource('demo', './images/cover.png')).toBe(
      '/content-assets/notes/demo/images/cover.png',
    )
    expect(resolveImageSource('demo', 'cover 图.png')).toBe(
      '/content-assets/notes/demo/cover%20%E5%9B%BE.png',
    )
  })

  it('保留外部图片地址', () => {
    expect(resolveImageSource('demo', 'https://example.com/a.png')).toBe(
      'https://example.com/a.png',
    )
    expect(resolveImageSource('demo', '/static/a.png')).toBe('/static/a.png')
  })

  it('拒绝越出笔记目录的相对路径', () => {
    expect(() => resolveImageSource('demo', '../secret.png')).toThrow('图片路径不合法')
  })

  it('长文图片使用独立的资源地址', () => {
    expect(resolveImageSource('demo-log-02', 'images/cover.png', 'article')).toBe(
      '/content-assets/articles/demo-log-02/images/cover.png',
    )

    const html = renderMarkdown({
      slug: 'demo-log-02',
      kind: 'article',
      body: '![封面](images/cover.png)',
    })

    expect(html).toContain('src="/content-assets/articles/demo-log-02/images/cover.png"')
  })

  it('渲染时改写图片并添加懒加载属性', () => {
    const html = renderMarkdown({
      slug: 'demo',
      body: '![封面](./images/cover.png)\n\n![外部](https://example.com/a.png)',
    })

    expect(html).toContain('src="/content-assets/notes/demo/images/cover.png"')
    expect(html).toContain('src="https://example.com/a.png"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('decoding="async"')
  })
})
