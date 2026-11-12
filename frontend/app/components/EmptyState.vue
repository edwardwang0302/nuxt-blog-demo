<template>
  <div :class="$style.empty">
    <p v-if="eyebrow" :class="$style.eyebrow">{{ eyebrow }}</p>
    <h2 :class="$style.title">{{ title }}</h2>
    <p v-if="description" :class="$style.description">{{ description }}</p>
    <BaseButton v-if="actionLabel" variant="secondary" @click="$emit('action')">
      {{ actionLabel }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    actionLabel?: string
  }>(),
  {
    eyebrow: '',
    description: '',
    actionLabel: '',
  },
)

defineEmits<{
  action: []
}>()
</script>

<style module lang="scss">
@use '../assets/styles/tokens' as tokens;

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: tokens.$space-16;
  padding: tokens.$space-24;
  background-color: var(--color-surface);
  border: tokens.$border-1 solid var(--color-border);
  border-radius: tokens.$radius-8;
}

.eyebrow {
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
  font-size: tokens.$text-h2-article-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-h2-article-line;
}

.description {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;
}
</style>
