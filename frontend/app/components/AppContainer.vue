<template>
  <component :is="as" :class="[$style.container, width === 'content' && $style.content]">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    width?: 'wide' | 'content'
  }>(),
  {
    as: 'div',
    width: 'wide',
  },
)
</script>

<style module lang="scss">
@use '../assets/styles/mixins' as mixins;
@use '../assets/styles/tokens' as tokens;

.container {
  width: min(calc(100% - #{2 * tokens.$gutter-mobile}), tokens.$container-wide);
  margin-inline: auto;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    width: min(calc(100% - #{2 * tokens.$gutter-tablet}), tokens.$container-wide);
  }

  @include mixins.media-up(tokens.$breakpoint-desktop) {
    width: min(calc(100% - #{2 * tokens.$gutter-desktop}), tokens.$container-wide);
  }

  @include mixins.media-up(tokens.$breakpoint-wide) {
    width: min(calc(100% - #{2 * tokens.$gutter-wide}), tokens.$container-wide);
  }
}

.content {
  width: min(calc(100% - #{2 * tokens.$gutter-mobile}), tokens.$content-width);

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    width: min(calc(100% - #{2 * tokens.$gutter-tablet}), tokens.$content-width);
  }

  @include mixins.media-up(tokens.$breakpoint-desktop) {
    width: min(calc(100% - #{2 * tokens.$gutter-desktop}), tokens.$content-width);
  }

  @include mixins.media-up(tokens.$breakpoint-wide) {
    width: min(calc(100% - #{2 * tokens.$gutter-wide}), tokens.$content-width);
  }
}
</style>
