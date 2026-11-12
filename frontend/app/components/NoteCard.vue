<template>
  <NuxtLink :to="to" :class="$style.card">
    <div :class="$style.content">
      <p :class="$style.meta">{{ meta }}</p>
      <h3 :class="$style.title">{{ title }}</h3>
      <p :class="$style.summary">{{ summary }}</p>
      <ul v-if="tags?.length" :class="$style.tags" aria-label="标签">
        <li v-for="tag in tags" :key="tag">
          <BaseTag :label="tag" />
        </li>
      </ul>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  meta: string
  title: string
  summary: string
  tags?: string[]
}>()
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.card {
  position: relative;
  display: flex;
  min-height: tokens.$card-min-height;
  overflow: hidden;
  color: var(--color-fg);
  background-color: var(--color-surface);
  border: tokens.$border-1 solid var(--color-border);
  border-radius: tokens.$radius-8;
  text-decoration: none;
  isolation: isolate;
}

.card::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--color-surface-hover);
  opacity: 0;
  transition: opacity 120ms ease;
  content: '';
  pointer-events: none;
}

.card:hover::after {
  opacity: 1;
}

.card:focus-visible {
  @include mixins.focus-ring;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: tokens.$space-16;
  padding: tokens.$space-24;
}

.meta {
  margin: 0;
  color: var(--color-fg-muted);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-meta-line;
}

.title {
  margin: 0;
  color: var(--color-fg);
  font-family: tokens.$font-sans;
  font-size: tokens.$text-card-title-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-card-title-line;
}

.summary {
  flex: 1;
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-line;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-8;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
