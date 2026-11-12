<template>
  <div :class="$style.page">
    <AppContainer width="content">
      <header :class="$style.header">
        <p :class="$style.eyebrow">ABOUT / 关于</p>
        <h1 :class="$style.title">关于这个示例</h1>
        <p :class="$style.lead">
          这是一个只包含博客前端的 Nuxt 4 示例：内容存放在 Git
          里，服务端读取后交给页面渲染，不依赖数据库和外部内容服务。
        </p>
      </header>

      <section :class="$style.section" aria-labelledby="intro">
        <h2 id="intro" :class="$style['section-title']">这个仓库演示什么</h2>
        <div :class="$style.prose">
          <p>
            <code>content/</code> 里的 Markdown 是唯一内容源。构建前会校验 frontmatter、日期、标签和
            slug，草稿会被过滤，标签与系列会自动聚合。
          </p>
          <p>
            页面通过服务端接口读取内容，图片使用相对路径并在运行时改写。主题默认跟随系统，也可以手动切换并记住选择。
          </p>
          <p>
            仓库里的文章和图片都是演示数据，不对应真实经历。可以删除它们，按
            <code>docs/authoring.md</code> 换成自己的内容。
          </p>
        </div>
      </section>

      <section :class="$style.section" aria-labelledby="stack">
        <h2 id="stack" :class="$style['section-title']">技术栈</h2>
        <div :class="$style.groups">
          <div :class="$style.group">
            <h3 :class="$style['group-title']">前端</h3>
            <ul :class="$style.tags" aria-label="前端技术">
              <li v-for="skill in frontendSkills" :key="skill">
                <BaseTag :label="skill" />
              </li>
            </ul>
          </div>
          <div :class="$style.group">
            <h3 :class="$style['group-title']">内容与样式</h3>
            <ul :class="$style.tags" aria-label="内容与样式技术">
              <li v-for="skill in contentSkills" :key="skill">
                <BaseTag :label="skill" />
              </li>
            </ul>
          </div>
          <div :class="$style.group">
            <h3 :class="$style['group-title']">工程与部署</h3>
            <ul :class="$style.tags" aria-label="工程与部署技术">
              <li v-for="skill in engineeringSkills" :key="skill">
                <BaseTag :label="skill" />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section :class="$style.section" aria-labelledby="flow">
        <h2 id="flow" :class="$style['section-title']">内容如何流动</h2>
        <ul :class="$style.list">
          <li>
            <strong>读取</strong>
            <span>服务端扫描 Markdown，解析 frontmatter，过滤草稿。</span>
          </li>
          <li>
            <strong>聚合</strong>
            <span>按标签和系列整理摘要，供目录、首页和系列页使用。</span>
          </li>
          <li>
            <strong>渲染</strong>
            <span>页面消费接口数据，Markdown 在服务端转成 HTML。</span>
          </li>
        </ul>
      </section>

      <section :class="$style.section" aria-labelledby="next">
        <h2 id="next" :class="$style['section-title']">从哪里开始读</h2>
        <div :class="$style.prose">
          <p>
            先看
            <BaseLink to="/notes">笔记目录</BaseLink
            >，再打开任意一篇带图片的详情页。想了解结构，可以读 <code>docs/authoring.md</code> 和
            <code>docs/design-system.md</code>。
          </p>
        </div>
      </section>
    </AppContainer>
  </div>
</template>

<script setup lang="ts">
const siteUrl = useRuntimeConfig().public.siteUrl
const title = '关于这个示例'
const description = '一个用 Nuxt 4 构建的个人笔记站示例：Markdown 内容管线、标签与系列、亮暗主题。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: `${siteUrl}/about`,
})

const frontendSkills = ['Vue 3', 'Nuxt 4', 'TypeScript', 'Nitro']
const contentSkills = ['Markdown', 'frontmatter', 'Zod', 'SCSS']
const engineeringSkills = ['Vitest', 'Playwright', 'Docker', 'Caddy']
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.page {
  padding-block-end: tokens.$space-64;
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
  font-size: tokens.$text-body-lg-about-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-lg-about-line;
}

.section {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  padding-block: tokens.$space-32;
  border-bottom: tokens.$border-1 solid var(--color-border);
}

.section:last-child {
  border-bottom: 0;
}

.section-title {
  margin: 0;
  color: var(--color-fg);
  font-size: tokens.$text-h2-article-size;
  font-weight: tokens.$font-weight-semibold;
  line-height: tokens.$text-h2-article-line;
}

.prose {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  color: var(--color-fg);
  font-size: tokens.$text-body-md-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-md-line;
}

.prose p {
  margin: 0;
}

.groups {
  display: grid;
  grid-template-columns: 1fr;
  gap: tokens.$space-24;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.group {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-12;
}

.group-title {
  margin: 0;
  color: var(--color-fg-muted);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-meta-line;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-8;
  margin: 0;
  padding: 0;
  list-style: none;
}

.list {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  margin: 0;
  padding: 0;
  list-style: none;
}

.list li {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-4;
  font-size: tokens.$text-body-md-size;
  line-height: tokens.$text-body-md-line;
}

.list strong {
  color: var(--color-fg);
  font-weight: tokens.$font-weight-semibold;
}

.list span {
  color: var(--color-fg-muted);
}
</style>
