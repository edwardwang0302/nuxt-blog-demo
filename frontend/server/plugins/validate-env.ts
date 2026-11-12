export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return

  if (!process.env.NUXT_PUBLIC_SITE_URL) {
    throw new Error(
      '缺少必需环境变量 NUXT_PUBLIC_SITE_URL。请在部署环境中设置为站点完整地址，例如 https://example.com。',
    )
  }
})
