import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = ['/', '/notes', '/notes/demo-image', '/notes/series/demo-log', '/about']

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} 主题`, () => {
    test.use({ colorScheme: theme })

    for (const path of pages) {
      test(`${path} 没有严重可访问性违规`, async ({ page }) => {
        await page.goto(path)

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()

        const serious = results.violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        )

        expect(
          serious.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.map((node) => node.target.join(' ')),
          })),
        ).toEqual([])
      })
    }
  })
}
