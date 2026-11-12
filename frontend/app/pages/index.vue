<template>
  <div :class="$style.page">
    <AppContainer>
      <section :class="$style.hero">
        <p :class="$style.eyebrow">Demo Notes / 一个可运行的博客示例</p>
        <h1 :class="$style.title">把动手实验，整理成可读的笔记</h1>
        <p :class="$style.lead">
          这是一个用 Nuxt 4 构建的博客示例：内容存在 Git
          里，构建时校验，页面通过接口读取。所有文章都是演示数据，可以整体替换。
        </p>
        <div :class="$style.actions">
          <BaseButton to="/notes">阅读笔记</BaseButton>
          <BaseButton to="/about" variant="secondary">了解这个示例</BaseButton>
        </div>
      </section>

      <section :class="$style.latest" aria-labelledby="latest-notes">
        <div :class="$style['section-heading']">
          <h2 id="latest-notes" :class="$style['section-title']">最新内容</h2>
          <BaseLink v-if="notes.length" to="/notes" :class="$style['section-link']">
            全部笔记 →
          </BaseLink>
        </div>

        <ul v-if="notes.length" :class="$style.grid">
          <li v-for="note in notes" :key="note.slug">
            <NoteCard
              :to="`/notes/${note.slug}`"
              :meta="formatNoteMeta(note)"
              :title="note.title"
              :summary="note.summary"
              :tags="note.tags"
            />
          </li>
        </ul>

        <EmptyState
          v-else
          title="还没有已发布的笔记"
          description="第一篇笔记正在整理中。可以先了解这个示例的结构。"
          action-label="了解这个示例"
          @action="goToAbout"
        />
      </section>
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import { formatNoteMeta } from '~/utils/notes'

const { data } = await useNotes()
const siteUrl = useRuntimeConfig().public.siteUrl
const title = '把动手实验，整理成可读的笔记'
const description = '一个用 Nuxt 4 构建的个人笔记站示例：Markdown 内容管线、标签与系列、亮暗主题。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
})

const notes = computed(() => (data.value?.notes ?? []).slice(0, 6))
const goToAbout = () => navigateTo('/about')
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.page {
  padding-block-end: tokens.$space-64;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: tokens.$space-24;
  padding-block: tokens.$space-48 tokens.$space-64;
  text-align: center;
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
  max-width: 18ch;
  margin: 0;
  color: var(--color-fg);
  font-family: tokens.$font-sans;
  font-size: tokens.$text-h2-section-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-section-line;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    font-size: tokens.$text-h1-page-size;
    line-height: tokens.$text-h1-page-line;
  }
}

.lead {
  max-width: 40ch;
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    font-size: tokens.$text-body-lg-size;
    line-height: tokens.$text-body-lg-line;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: tokens.$space-12;
  margin-block-start: tokens.$space-8;
}

.latest {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-24;
  padding-block-start: tokens.$space-48;
  border-top: tokens.$border-1 solid var(--color-border);
}

.section-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: tokens.$space-16;
}

.section-title {
  margin: 0;
  color: var(--color-fg);
  font-size: tokens.$text-h2-section-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-section-line;
}

.section-link {
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  line-height: tokens.$text-meta-line;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: tokens.$space-24;
  margin: 0;
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
