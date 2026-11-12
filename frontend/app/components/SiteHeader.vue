<template>
  <header :class="$style.header">
    <AppContainer :class="$style.inner">
      <NuxtLink to="/" :class="$style.logo">Demo Notes</NuxtLink>
      <nav :class="$style.nav" aria-label="主导航">
        <BaseButton
          to="/"
          variant="secondary"
          :aria-current="current === 'home' ? 'page' : undefined"
        >
          首页
        </BaseButton>
        <BaseButton
          to="/notes"
          variant="secondary"
          :aria-current="current === 'notes' ? 'page' : undefined"
        >
          笔记
        </BaseButton>
        <BaseButton
          to="/about"
          variant="secondary"
          :aria-current="current === 'about' ? 'page' : undefined"
        >
          关于
        </BaseButton>
        <ThemeToggle />
      </nav>
    </AppContainer>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  current?: 'home' | 'notes' | 'about'
}>()
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.header {
  border-bottom: tokens.$border-1 solid var(--color-border);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-24;
  padding-block: tokens.$space-24;
}

.logo {
  color: var(--color-fg);
  font-family: tokens.$font-sans;
  font-size: tokens.$text-logo-size;
  font-weight: tokens.$font-weight-bold;
  line-height: tokens.$text-logo-line;
  text-decoration: none;
  white-space: nowrap;
}

.logo:focus-visible {
  @include mixins.focus-ring;

  border-radius: tokens.$radius-8;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: tokens.$space-8;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    gap: tokens.$space-24;
  }
}
</style>
