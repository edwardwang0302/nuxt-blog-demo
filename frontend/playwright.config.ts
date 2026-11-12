import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3200'
// 本地没有下载 Playwright 浏览器时，可用 PLAYWRIGHT_CHANNEL=chrome 复用系统 Chrome。
const channel = process.env.PLAYWRIGHT_CHANNEL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) },
    },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    url: baseURL,
    env: {
      PORT: '3200',
      HOST: '127.0.0.1',
      NUXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3200',
    },
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === 'true',
    timeout: 120_000,
  },
})
