<template>
  <button type="button" :aria-pressed="selected" :class="$style.filter" @click="$emit('toggle')">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    selected?: boolean
  }>(),
  {
    selected: false,
  },
)

defineEmits<{
  toggle: []
}>()
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.filter {
  display: inline-flex;
  align-items: center;
  min-height: tokens.$control-height;
  padding: tokens.$space-12 tokens.$space-16;
  border: tokens.$border-1 solid var(--color-control-border-subtle);
  border-radius: tokens.$radius-8;
  color: var(--color-fg);
  background-color: var(--color-control-bg-secondary);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-meta-line;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease;
}

.filter:hover {
  background-color: var(--color-control-bg-secondary-hover);
}

.filter[aria-pressed='true'] {
  background-color: var(--color-control-bg-primary);
  border-color: var(--color-control-border);
}

.filter[aria-pressed='true']:hover {
  background-color: var(--color-control-bg-primary-hover);
}

.filter:focus-visible {
  @include mixins.focus-ring;
}
</style>
