<template>
  <NuxtLink v-if="to" v-bind="$attrs" :to="to" :class="[$style.link, muted && $style.muted]">
    <slot />
  </NuxtLink>
  <a v-else v-bind="$attrs" :href="href" :class="[$style.link, muted && $style.muted]">
    <slot />
  </a>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    to?: string
    href?: string
    muted?: boolean
  }>(),
  {
    to: undefined,
    href: undefined,
    muted: false,
  },
)
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.link {
  color: var(--color-fg);
  text-decoration: none;
  text-underline-offset: tokens.$space-4;
  transition: color 120ms ease;
}

.link:hover {
  text-decoration: underline;
}

.link:focus-visible {
  @include mixins.focus-ring;

  border-radius: tokens.$radius-8;
}

.muted {
  color: var(--color-fg-muted);
}

.muted:hover {
  color: var(--color-fg);
}
</style>
