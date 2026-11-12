// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compile } from 'sass'

const THEMES_PATH = fileURLToPath(new URL('../../app/assets/styles/_themes.scss', import.meta.url))
const MAIN_STYLES_PATH = fileURLToPath(
  new URL('../../app/assets/styles/main.scss', import.meta.url),
)
const DOCS_PATH = fileURLToPath(new URL('../../../docs/design-tokens.md', import.meta.url))
const COMPONENTS_DIR = fileURLToPath(new URL('../../app/components', import.meta.url))
const LAYOUTS_DIR = fileURLToPath(new URL('../../app/layouts', import.meta.url))
const APP_VUE_PATH = fileURLToPath(new URL('../../app/app.vue', import.meta.url))

type Rgba = [number, number, number, number]

const parseColor = (value: string): Rgba => {
  if (value.startsWith('#')) {
    let hex = value.slice(1)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }
    expect(hex).toMatch(/^[0-9a-f]{6}$/i)
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
      1,
    ]
  }

  const match = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)%)?\s*\)$/)
  if (!match) throw new Error(`无法解析颜色：${value}`)
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] === undefined ? 1 : Number(match[4]) / 100,
  ]
}

const composite = (foreground: Rgba, background: Rgba): Rgba => {
  const alpha = foreground[3]
  return [
    foreground[0] * alpha + background[0] * (1 - alpha),
    foreground[1] * alpha + background[1] * (1 - alpha),
    foreground[2] * alpha + background[2] * (1 - alpha),
    1,
  ]
}

const luminance = ([red, green, blue]: Rgba): number => {
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

const contrastRatio = (first: Rgba, second: Rgba): number => {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

const extractBlock = (css: string, selectorPattern: RegExp): string => {
  const match = css.match(new RegExp(`${selectorPattern.source}\\s*\\{([^}]*)\\}`, 's'))
  if (!match) throw new Error(`找不到主题块：${selectorPattern}`)
  return match[1]!
}

const parseTokens = (block: string): Record<string, string> =>
  Object.fromEntries(
    [...block.matchAll(/(--[a-z-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1]!,
      match[2]!.trim(),
    ]),
  )

const themeCss = compile(THEMES_PATH).css
const lightTokens = parseTokens(extractBlock(themeCss, /:root\b/))
const darkTokens = parseTokens(extractBlock(themeCss, /\[data-theme=["']?dark["']?\]/))

const resolveColor = (tokens: Record<string, string>, token: string, baseToken: string): Rgba =>
  composite(parseColor(tokens[token]!), parseColor(tokens[baseToken]!))

interface ContrastPair {
  label: string
  fg: string
  bg: string
  base?: string
  min: number
}

const TEXT_PAIRS: ContrastPair[] = [
  { label: '正文 / 页面', fg: '--color-fg', bg: '--color-bg', min: 4.5 },
  { label: '次要文字 / 页面', fg: '--color-fg-muted', bg: '--color-bg', min: 4.5 },
  { label: '正文 / 卡片', fg: '--color-fg', bg: '--color-surface', min: 4.5 },
  { label: '次要文字 / 卡片', fg: '--color-fg-muted', bg: '--color-surface', min: 4.5 },
  {
    label: '正文 / 卡片 hover',
    fg: '--color-fg',
    bg: '--color-surface-hover',
    base: '--color-surface',
    min: 4.5,
  },
  {
    label: '次要文字 / 卡片 hover',
    fg: '--color-fg-muted',
    bg: '--color-surface-hover',
    base: '--color-surface',
    min: 4.5,
  },
  { label: '标签文字 / 标签底色', fg: '--color-tag-fg', bg: '--color-tag-bg', min: 4.5 },
  { label: '标签文字 / 选中标签', fg: '--color-fg', bg: '--color-tag-bg-selected', min: 4.5 },
  { label: '主按钮文字', fg: '--color-fg', bg: '--color-control-bg-primary', min: 4.5 },
  { label: '次按钮文字', fg: '--color-fg', bg: '--color-control-bg-secondary', min: 4.5 },
  {
    label: '次按钮 hover 文字',
    fg: '--color-fg',
    bg: '--color-control-bg-secondary-hover',
    min: 4.5,
  },
  { label: '进行中状态文字', fg: '--color-status', bg: '--color-status-bg', min: 4.5 },
  { label: '焦点环 / 页面', fg: '--color-focus-ring', bg: '--color-bg', min: 3 },
]

const THEMES = [
  ['亮色', lightTokens],
  ['暗色', darkTokens],
] as const

describe('主题颜色 tokens', () => {
  it('亮暗主题定义相同的 token 集合', () => {
    expect(Object.keys(lightTokens).sort()).toEqual(Object.keys(darkTokens).sort())
    expect(Object.keys(lightTokens)).toHaveLength(19)
  })

  it('所有颜色值都可解析', () => {
    for (const [name, tokens] of THEMES) {
      for (const [token, value] of Object.entries(tokens)) {
        expect(() => parseColor(value), `${name} ${token}: ${value}`).not.toThrow()
      }
    }
  })

  it('docs/design-tokens.md 记录了每个主题 token', () => {
    const docs = readFileSync(DOCS_PATH, 'utf8')
    for (const token of Object.keys(lightTokens)) {
      expect(docs, `${token} 未写入设计文档`).toContain(token)
    }
  })

  for (const [name, tokens] of THEMES) {
    for (const pair of TEXT_PAIRS) {
      it(`${name}主题：${pair.label} 对比度 ≥ ${pair.min}:1`, () => {
        const base = pair.base ?? '--color-bg'
        const foreground = resolveColor(tokens, pair.fg, base)
        const background = resolveColor(tokens, pair.bg, base)
        expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(pair.min)
      })
    }
  }
})

describe('组件不硬编码颜色', () => {
  const componentFiles = readdirSync(COMPONENTS_DIR)
    .filter((file) => file.endsWith('.vue'))
    .map((file) => `${COMPONENTS_DIR}/${file}`)
  const layoutFiles = readdirSync(LAYOUTS_DIR)
    .filter((file) => file.endsWith('.vue'))
    .map((file) => `${LAYOUTS_DIR}/${file}`)

  const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g

  for (const file of [...componentFiles, ...layoutFiles, APP_VUE_PATH, MAIN_STYLES_PATH]) {
    it(`${file.split('/').slice(-2).join('/')} 只引用 var(--color-*)`, () => {
      const source = readFileSync(file, 'utf8')
      expect(source.match(colorLiteral) ?? []).toEqual([])
    })
  }
})
