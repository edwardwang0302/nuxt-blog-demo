<template>
  <div :class="$style.page">
    <AppContainer width="content">
      <BaseLink to="/notes" :class="$style.back">← 返回笔记</BaseLink>

      <header :class="$style.header">
        <p :class="$style.meta">{{ formatNoteMeta(note) }}</p>
        <h1 :class="$style.title">{{ note.title }}</h1>
        <p :class="$style.summary">{{ note.summary }}</p>
        <ul v-if="note.tags.length" :class="$style.tags" aria-label="标签">
          <li v-for="tag in note.tags" :key="tag">
            <BaseTag :label="tag" />
          </li>
        </ul>
      </header>

      <!-- eslint-disable-next-line vue/no-v-html -- 内容来自仓库内 Markdown，markdown-it 已禁用原始 HTML -->
      <div :class="[$style.prose, 'article-prose']" v-html="note.html" />

      <section v-if="note.repo || note.website" :class="$style.explore" aria-labelledby="explore">
        <h2 id="explore" :class="$style['explore-title']">继续探索</h2>
        <ul :class="$style.links">
          <li v-if="note.repo">
            <BaseLink :href="note.repo" target="_blank" rel="noreferrer">仓库地址 ↗</BaseLink>
          </li>
          <li v-if="note.website">
            <BaseLink :href="note.website" target="_blank" rel="noreferrer">官网 ↗</BaseLink>
          </li>
        </ul>
      </section>
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import type { NoteDetailResponse } from '~/types/content'
import { formatNoteMeta } from '~/utils/notes'

const route = useRoute()
const slug = String(route.params.slug)

const { data, error } = await useFetch<NoteDetailResponse>(`/api/notes/${encodeURIComponent(slug)}`)

const note = data.value?.note

if (error.value || !note) {
  throw createError({ statusCode: 404, statusMessage: '笔记不存在' })
}

const siteUrl = useRuntimeConfig().public.siteUrl

useSeoMeta({
  title: note.title,
  description: note.summary,
  ogTitle: note.title,
  ogDescription: note.summary,
  ogType: 'article',
  ogUrl: `${siteUrl}/notes/${note.slug}`,
  articlePublishedTime: note.date,
})
</script>

<style module lang="scss">
@use '../../assets/styles/mixins' as mixins;
@use '../../assets/styles/tokens' as tokens;

.page {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-32;
  padding-block-end: tokens.$space-64;
}

.back {
  align-self: flex-start;
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
  font-size: tokens.$text-h2-section-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-section-line;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    font-size: tokens.$text-h1-article-size;
    line-height: tokens.$text-h1-article-line;
  }
}

.summary {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-lg-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-lg-line;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-8;
  margin: 0;
  padding: 0;
  list-style: none;
}

.prose {
  color: var(--color-fg);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;
}

.explore {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-12;
  padding-block-start: tokens.$space-32;
  border-top: tokens.$border-1 solid var(--color-border);
}

.explore-title {
  margin: 0;
  color: var(--color-fg);
  font-size: tokens.$text-h2-article-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-article-line;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-24;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: tokens.$text-body-md-size;
  line-height: tokens.$text-body-md-line;
}
</style>

<!--
  v-html 生成的节点拿不到 CSS Modules 的哈希类名，`:deep()` 在没有 scoped 的
  style module 里也不会被编译。这里用独立的全局样式块，以 article-prose
  作为命名空间，集中处理正文排版。
-->
<style lang="scss">
@use '../../assets/styles/mixins' as mixins;
@use '../../assets/styles/tokens' as tokens;

.article-prose h2 {
  margin: tokens.$space-48 0 tokens.$space-16;
  color: var(--color-fg);
  font-size: tokens.$text-h2-article-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-article-line;
}

.article-prose h2:first-child {
  margin-block-start: 0;
}

.article-prose h3 {
  margin: tokens.$space-32 0 tokens.$space-12;
  color: var(--color-fg);
  font-size: tokens.$text-subtitle-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-subtitle-line;
}

.article-prose p {
  margin: 0 0 tokens.$space-16;
}

.article-prose ul,
.article-prose ol {
  margin: 0 0 tokens.$space-16;
  padding-inline-start: tokens.$space-24;
}

.article-prose li {
  margin-block-end: tokens.$space-8;
}

.article-prose strong {
  font-weight: tokens.$font-weight-semibold;
}

.article-prose a {
  color: var(--color-fg);
  text-underline-offset: tokens.$space-4;
}

.article-prose a:focus-visible {
  @include mixins.focus-ring;

  border-radius: tokens.$radius-8;
}

.article-prose code {
  padding: tokens.$space-4 tokens.$space-8;
  border: tokens.$border-1 solid var(--color-border);
  border-radius: tokens.$radius-8;
  font-family: tokens.$font-mono;
  font-size: tokens.$text-code-size;
  line-height: tokens.$text-code-line;
  background-color: var(--color-surface);
}

.article-prose pre {
  margin: 0 0 tokens.$space-24;
  padding: tokens.$space-16;
  overflow-x: auto;
  border: tokens.$border-1 solid var(--color-border);
  border-radius: tokens.$radius-8;
  background-color: var(--color-surface);
}

.article-prose pre code {
  padding: 0;
  border: 0;
  background: none;
}

.article-prose blockquote {
  margin: 0 0 tokens.$space-16;
  padding-inline-start: tokens.$space-16;
  border-inline-start: tokens.$border-1 solid var(--color-border);
  color: var(--color-fg-muted);
}

.article-prose img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: tokens.$space-24 0;
  border: tokens.$border-1 solid var(--color-border);
  border-radius: tokens.$radius-8;
}

.article-prose hr {
  margin: tokens.$space-48 0;
  border: 0;
  border-top: tokens.$border-1 solid var(--color-border);
}
</style>
