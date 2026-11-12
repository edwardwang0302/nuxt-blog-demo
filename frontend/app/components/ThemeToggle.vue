<template>
  <BaseButton variant="secondary" @click="toggle">
    <span :class="$style.content">
      <span :class="$style['sr-only']">切换到</span>
      <span :class="[$style.label, $style['label-light']]">暗色</span>
      <span :class="[$style.label, $style['label-dark']]">浅色</span>
      <svg
        :class="$style.icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path :class="$style['icon-light']" d="M8 1a7 7 0 0 0 0 14V1Z" fill="currentColor" />
        <path :class="$style['icon-dark']" d="M8 1a7 7 0 0 1 0 14V1Z" fill="currentColor" />
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </span>
  </BaseButton>
</template>

<script setup lang="ts">
const { toggle } = useTheme()
</script>

<style module lang="scss">
@use '../assets/styles/tokens' as tokens;

.content {
  display: inline-flex;
  align-items: center;
  gap: tokens.$space-4;
}

.icon {
  display: block;
  flex: none;
}

.label-dark,
.icon-dark {
  display: none;
}

:global([data-theme='dark']) .label-light,
:global([data-theme='dark']) .icon-light {
  display: none;
}

:global([data-theme='dark']) .label-dark {
  display: inline;
}

:global([data-theme='dark']) .icon-dark {
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
