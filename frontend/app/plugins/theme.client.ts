export default defineNuxtPlugin((nuxtApp) => {
  const { init } = useTheme()

  nuxtApp.hook('app:mounted', () => {
    init()
  })
})
