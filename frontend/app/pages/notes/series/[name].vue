<template>
  <div :class="$style.page">
    <AppContainer>
      <BaseLink to="/notes" :class="$style.back">← 返回笔记</BaseLink>

      <header :class="$style.header">
        <p :class="$style.eyebrow">SERIES / 系列</p>
        <h1 :class="$style.title">{{ series.name }}</h1>
        <p :class="$style.lead">共 {{ series.count }} 篇，按时间顺序排列。</p>
      </header>

      <ul :class="$style.grid">
        <li v-for="note in series.notes" :key="note.slug">
          <NoteCard
            :to="`/notes/${note.slug}`"
            :meta="formatNoteMeta(note)"
            :title="note.title"
            :summary="note.summary"
            :tags="note.tags"
          />
        </li>
      </ul>
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import { formatNoteMeta } from '~/utils/notes'

const route = useRoute()
const name = String(route.params.name)

const { data, error } = await useNotes()
const series = data.value?.series.find((item) => item.name === name)

if (error.value || !series) {
  throw createError({ statusCode: 404, statusMessage: '系列不存在' })
}

const siteUrl = useRuntimeConfig().public.siteUrl

useSeoMeta({
  title: `${series.name} 系列`,
  description: `${series.name} 系列的 ${series.count} 篇内容，按时间顺序排列。`,
  ogTitle: `${series.name} 系列`,
  ogDescription: `${series.name} 系列的 ${series.count} 篇内容，按时间顺序排列。`,
  ogType: 'website',
  ogUrl: `${siteUrl}/notes/series/${encodeURIComponent(series.name)}`,
})
</script>

<style module lang="scss">
@use '../../../assets/styles/mixins' as mixins;
@use '../../../assets/styles/tokens' as tokens;

.page {
  padding-block-end: tokens.$space-64;
}

.back {
  display: inline-block;
  margin-block-end: tokens.$space-32;
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  line-height: tokens.$text-meta-line;
}

.header {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  padding-block-end: tokens.$space-32;
  border-bottom: tokens.$border-1 solid var(--color-border);
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
  font-size: tokens.$text-h2-section-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-section-line;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    font-size: tokens.$text-h1-page-size;
    line-height: tokens.$text-h1-page-line;
  }
}

.lead {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: tokens.$space-24;
  margin: 0;
  margin-block-start: tokens.$space-32;
  padding: 0;
  list-style: none;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include mixins.media-up(tokens.$breakpoint-wide) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
