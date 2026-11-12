<template>
  <div :class="$style.page">
    <AppContainer>
      <header :class="$style.header">
        <p :class="$style.eyebrow">INDEX / 笔记</p>
        <h1 :class="$style.title">笔记</h1>
        <p :class="$style.lead">
          工具、仓库与动手实验的短笔记，以及构建记录长文。按标签筛选，或直接翻卡片。
        </p>
      </header>

      <nav v-if="series.length" :class="$style.series" aria-label="笔记系列">
        <span :class="$style['series-label']">系列</span>
        <BaseLink
          v-for="item in series"
          :key="item.name"
          :to="`/notes/series/${encodeURIComponent(item.name)}`"
          :class="$style['series-link']"
        >
          {{ item.name }}（{{ item.count }}）
        </BaseLink>
      </nav>

      <div :class="$style.filters" role="group" aria-label="按标签筛选">
        <TopicFilter label="全部" :selected="!activeTag" @toggle="clearTag" />
        <TopicFilter
          v-for="tag in tags"
          :key="tag.name"
          :label="tag.name"
          :selected="activeTag === tag.name"
          @toggle="toggleTag(tag.name)"
        />
      </div>

      <ul v-if="filteredNotes.length" :class="$style.grid">
        <li v-for="note in filteredNotes" :key="note.slug">
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
        v-else-if="activeTag"
        :class="$style.empty"
        eyebrow="筛选结果"
        title="这个标签下还没有笔记"
        description="换一个标签，或清除筛选查看全部笔记。"
        action-label="清除筛选"
        @action="clearTag"
      />

      <EmptyState
        v-else
        :class="$style.empty"
        title="还没有已发布的笔记"
        description="第一篇笔记正在整理中。可以先了解这个示例的结构。"
        action-label="了解这个示例"
        @action="goToAbout"
      />
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import { formatNoteMeta } from '~/utils/notes'

const route = useRoute()
const router = useRouter()

const { data } = await useNotes()
const siteUrl = useRuntimeConfig().public.siteUrl
const title = '笔记'
const description = '工具、仓库与动手实验的短笔记，以及构建记录长文。按标签筛选。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: `${siteUrl}/notes`,
})

const notes = computed(() => data.value?.notes ?? [])
const tags = computed(() => data.value?.tags ?? [])
const series = computed(() => data.value?.series ?? [])
const activeTag = computed(() => (typeof route.query.tag === 'string' ? route.query.tag : ''))
const filteredNotes = computed(() =>
  activeTag.value ? notes.value.filter((note) => note.tags.includes(activeTag.value)) : notes.value,
)

const setTag = (tag: string) => {
  const query = { ...route.query }
  if (tag) {
    query.tag = tag
  } else {
    delete query.tag
  }
  router.push({ query })
}

const toggleTag = (tag: string) => setTag(activeTag.value === tag ? '' : tag)
const clearTag = () => setTag('')
const goToAbout = () => navigateTo('/about')
</script>

<style module lang="scss">
@use '../../assets/styles/mixins' as mixins;
@use '../../assets/styles/tokens' as tokens;

.page {
  padding-block-end: tokens.$space-64;
}

.header {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  padding-block-end: tokens.$space-32;
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
  max-width: tokens.$content-width;
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;
}

.series {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: tokens.$space-8 tokens.$space-16;
  padding-block-end: tokens.$space-24;
}

.series-label {
  color: var(--color-fg-muted);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  line-height: tokens.$text-meta-line;
}

.series-link {
  font-size: tokens.$text-body-size;
  line-height: tokens.$text-body-line;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-8;
  padding-block-end: tokens.$space-32;
  border-bottom: tokens.$border-1 solid var(--color-border);
}

.empty {
  margin-block-start: tokens.$space-32;
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
