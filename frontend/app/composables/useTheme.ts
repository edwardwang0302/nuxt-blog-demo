export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

// 沿用旧 key，避免品牌改名后重置已有主题偏好。
const STORAGE_KEY = 'fieldnotes-theme'

let initialized = false
let mediaQuery: MediaQueryList | null = null

const readStoredPreference = (): ThemePreference => {
  if (!import.meta.client) return 'system'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  } catch {
    return 'system'
  }
}

const systemTheme = (): ResolvedTheme => {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const preference = useState<ThemePreference>('theme-preference', () => 'system')
  const resolved = useState<ResolvedTheme>('theme-resolved', () => 'light')

  const apply = (value: ThemePreference, persist = true) => {
    preference.value = value
    resolved.value = value === 'system' ? systemTheme() : value

    if (!import.meta.client) return
    document.documentElement.dataset.theme = resolved.value

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value)
      } catch {
        // 存储不可用时只保留当前会话的主题。
      }
    }
  }

  const handleSystemChange = () => {
    if (preference.value !== 'system') return

    resolved.value = mediaQuery?.matches ? 'dark' : 'light'
    document.documentElement.dataset.theme = resolved.value
  }

  const init = () => {
    if (!import.meta.client || initialized) return
    initialized = true

    const value = readStoredPreference()
    const current = document.documentElement.dataset.theme
    preference.value = value
    resolved.value =
      current === 'dark' || current === 'light'
        ? current
        : value === 'system'
          ? systemTheme()
          : value

    document.documentElement.dataset.theme = resolved.value

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemChange)
  }

  const toggle = () => apply(resolved.value === 'dark' ? 'light' : 'dark')
  const setPreference = (value: ThemePreference) => apply(value)

  return {
    preference,
    resolved,
    init,
    toggle,
    setPreference,
  }
}
