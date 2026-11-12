<template>
  <NuxtLink v-if="to" v-bind="$attrs" :to="to" :class="[$style.button, $style[variant]]">
    <slot />
  </NuxtLink>
  <a v-else-if="href" v-bind="$attrs" :href="href" :class="[$style.button, $style[variant]]">
    <slot />
  </a>
  <button v-else v-bind="$attrs" :type="type" :class="[$style.button, $style[variant]]">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    to?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary'
  }>(),
  {
    to: undefined,
    href: undefined,
    type: 'button',
    variant: 'primary',
  },
)
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: tokens.$control-height;
  padding: tokens.$space-10 tokens.$space-16;
  border: tokens.$border-1 solid transparent;
  border-radius: tokens.$radius-8;
  color: var(--color-fg);
  font-family: tokens.$font-sans;
  font-size: tokens.$text-label-size;
  font-weight: tokens.$font-weight-medium;
  line-height: tokens.$text-label-line;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease;
}

.primary {
  background-color: var(--color-control-bg-primary);
  border-color: var(--color-control-border);
}

.primary:hover {
  background-color: var(--color-control-bg-primary-hover);
}

.secondary {
  background-color: var(--color-control-bg-secondary);
  border-color: var(--color-control-border-subtle);
}

.secondary:hover {
  background-color: var(--color-control-bg-secondary-hover);
  border-color: var(--color-control-border);
}

.button[aria-current='page'],
.button[aria-pressed='true'] {
  background-color: var(--color-control-bg-primary);
  border-color: var(--color-control-border);
}

.button[aria-current='page']:hover,
.button[aria-pressed='true']:hover {
  background-color: var(--color-control-bg-primary-hover);
}

.button:focus-visible {
  @include mixins.focus-ring;

  background-color: var(--color-control-bg-secondary-hover);
}
</style>
