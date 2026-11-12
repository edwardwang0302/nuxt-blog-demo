<template>
  <footer :class="$style.footer">
    <AppContainer :class="$style.inner">
      <div :class="$style.row">
        <p :class="$style.brand">Demo Notes / 一个可运行的博客示例。</p>
        <nav :class="$style.links" aria-label="页脚链接">
          <BaseLink href="/rss.xml" :class="$style['footer-link']">RSS 订阅 ↗</BaseLink>
        </nav>
      </div>
      <p :class="$style.copyright">© 2026 Demo Notes · 演示内容 · MIT License</p>
    </AppContainer>
  </footer>
</template>

<style module lang="scss">
@use '../assets/styles/tokens' as tokens;

.footer {
  border-top: tokens.$border-1 solid var(--color-border);
}

.inner {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-16;
  padding-block: tokens.$space-32;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: tokens.$space-16;
}

.brand {
  margin: 0;
  color: var(--color-fg-muted);
  font-size: tokens.$text-body-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-body-line;
}

.links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: tokens.$space-8;
  font-size: tokens.$text-label-size;
  font-weight: tokens.$font-weight-medium;
  line-height: tokens.$text-label-line;
}

.footer-link {
  font-weight: tokens.$font-weight-medium;
}

.copyright {
  margin: 0;
  color: var(--color-fg-muted);
  font-family: tokens.$font-mono;
  font-size: tokens.$text-meta-size;
  font-weight: tokens.$font-weight-regular;
  line-height: tokens.$text-meta-line;
}
</style>
