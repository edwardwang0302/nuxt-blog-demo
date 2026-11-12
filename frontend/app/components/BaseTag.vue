<template>
  <span :class="[$style.tag, $style[state]]">{{ label }}</span>
</template>

<script setup lang="ts">
type TagState = 'default' | 'selected' | 'in-progress'

withDefaults(
  defineProps<{
    label: string
    state?: TagState
  }>(),
  {
    state: 'default',
  },
)
</script>

<style module lang="scss">
@use '../assets/styles/tokens' as tokens;

.tag {
  display: inline-flex;
  align-items: center;
  padding: tokens.$space-4 tokens.$space-8;
  border: tokens.$border-1 solid var(--color-tag-border);
  border-radius: tokens.$radius-8;
  color: var(--color-tag-fg);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-meta-line;
  white-space: nowrap;
}

.default {
  background-color: var(--color-tag-bg);
}

.selected {
  color: var(--color-fg);
  background-color: var(--color-tag-bg-selected);
  border-color: var(--color-control-border);
}

.in-progress {
  color: var(--color-status);
  background-color: var(--color-status-bg);
}
</style>
