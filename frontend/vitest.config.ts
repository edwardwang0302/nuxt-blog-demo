import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    testTimeout: 20000,
    hookTimeout: 60000,
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/e2e/**'],
  },
})
