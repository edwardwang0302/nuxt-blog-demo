// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CONTENT_TYPES } from '../../server/utils/content'

const COMPONENTS_DIR = fileURLToPath(new URL('../../app/components', import.meta.url))
const USE_THEME_PATH = fileURLToPath(new URL('../../app/composables/useTheme.ts', import.meta.url))
const DOC_PATH = fileURLToPath(new URL('../../../docs/design-system.md', import.meta.url))
const AUTHORING_PATH = fileURLToPath(new URL('../../../docs/authoring.md', import.meta.url))

const docs = readFileSync(DOC_PATH, 'utf8')

const componentFiles = readdirSync(COMPONENTS_DIR)
  .filter((file) => file.endsWith('.vue'))
  .sort()

const readComponent = (file: string) => readFileSync(`${COMPONENTS_DIR}/${file}`, 'utf8')

const extractBlockNames = (source: string, block: 'defineProps' | 'defineEmits'): string[] => {
  const match = source.match(new RegExp(`${block}<\\{([\\s\\S]*?)\\}>`, 'm'))
  if (!match) return []
  return [...match[1]!.matchAll(/^\s*(\w+)\??:/gm)].map((item) => item[1]!)
}

describe('设计系统文档', () => {
  it('说明每个组件的用途', () => {
    for (const file of componentFiles) {
      const name = file.replace(/\.vue$/, '')
      expect(docs, `${name} 未写入 docs/design-system.md`).toContain(name)
    }
  })

  it('记录组件的全部 props', () => {
    for (const file of componentFiles) {
      for (const prop of extractBlockNames(readComponent(file), 'defineProps')) {
        expect(docs, `${file} 的 prop ${prop} 未写入文档`).toContain(`\`${prop}\``)
      }
    }
  })

  it('记录组件发出的事件', () => {
    for (const file of componentFiles) {
      for (const event of extractBlockNames(readComponent(file), 'defineEmits')) {
        expect(docs, `${file} 的事件 ${event} 未写入文档`).toContain(`\`${event}\``)
      }
    }
  })

  it('记录 useTheme 的返回值', () => {
    const source = readFileSync(USE_THEME_PATH, 'utf8')
    const match = source.match(/return \{([^}]*)\}/)
    expect(match, 'useTheme 应返回对象').not.toBeNull()

    for (const name of match![1]!.split(',').map((item) => item.trim())) {
      const documented = new RegExp(`\`${name}(?:\\([^\`]*\\))?\``).test(docs)
      expect(documented, `useTheme 返回值 ${name} 未写入文档`).toBe(true)
    }
  })
})

describe('写作文档', () => {
  const authoring = readFileSync(AUTHORING_PATH, 'utf8')

  it('记录全部 frontmatter 字段', () => {
    for (const field of [
      'title',
      'summary',
      'type',
      'date',
      'tags',
      'series',
      'repo',
      'website',
      'draft',
      'slug',
    ]) {
      expect(authoring, `字段 ${field} 未写入 docs/authoring.md`).toContain(`\`${field}\``)
    }
  })

  it('记录全部内容类型', () => {
    for (const type of CONTENT_TYPES) {
      expect(authoring, `类型 ${type} 未写入 docs/authoring.md`).toContain(`\`${type}\``)
    }
  })

  it('说明 slug、草稿和图片规则', () => {
    expect(authoring).toContain('kebab-case')
    expect(authoring).toContain('draft: true')
    expect(authoring).toContain('/content-assets/notes/')
  })
})
