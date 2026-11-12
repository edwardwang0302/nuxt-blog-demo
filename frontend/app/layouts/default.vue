<template>
  <div :class="$style.shell">
    <a :class="$style['skip-link']" href="#main-content">跳到主要内容</a>
    <SiteHeader :current="current" />
    <main id="main-content" :class="$style.main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const current = computed<'home' | 'notes' | 'about' | undefined>(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/notes')) return 'notes'
  if (route.path.startsWith('/about')) return 'about'
  return undefined
})
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding-block: tokens.$space-64;
}

// 跳转链接的落点不是可操作控件，避免整块内容出现焦点环。
.main:focus,
.main:focus-visible {
  outline: none;
}

.skip-link {
  position: fixed;
  top: tokens.$space-8;
  left: tokens.$space-8;
  z-index: 100;
  padding: tokens.$space-10 tokens.$space-16;
  border: tokens.$border-1 solid var(--color-control-border);
  border-radius: tokens.$radius-8;
  color: var(--color-fg);
  font-size: tokens.$text-label-size;
  font-weight: tokens.$font-weight-medium;
  line-height: tokens.$text-label-line;
  text-decoration: none;
  background-color: var(--color-bg);
  transform: translateY(calc(-100% - #{tokens.$space-16}));
}

.skip-link:focus,
.skip-link:focus-visible {
  @include mixins.focus-ring;

  transform: translateY(0);
}
</style>
