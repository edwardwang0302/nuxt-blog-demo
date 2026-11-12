# 设计系统：组件用法与约束

本文面向后续页面实现，说明基础组件的公开 API、组合方式和样式约定。数值来源与设计交接见 [design-tokens.md](design-tokens.md)；本文只记录「怎么用」。

## 1. 原则

- **tokens 是唯一来源**。组件不写死颜色、间距、圆角、字号和断点。
- **SCSS 预处理器变量**用于编译期常量：字号、行高、间距、圆角、断点、容器宽度。
- **CSS 自定义属性**用于需要运行时切换的颜色：`var(--color-*)`。
- **CSS Modules** 是组件样式的默认方式，不引入 Tailwind，也不使用全局类名组织组件。
- 组件只负责视觉与基础交互，不知道内容来自哪里；页面负责取数、排序和筛选状态。

## 2. 引入方式

组件位于 `frontend/app/components/`，Nuxt 自动导入，模板中直接使用：

```vue
<template>
  <BaseTag label="智能体" />
  <BaseButton to="/notes">浏览笔记</BaseButton>
</template>
```

组件样式内引用 tokens 与 mixins：

```scss
@use "../assets/styles/tokens" as tokens;
@use "../assets/styles/mixins" as mixins;
```

模板访问 CSS Module 类名使用 `$style`。多词类名用中括号访问：

```vue
<div :class="$style['section-title']">标题</div>
```

## 3. 组件清单

### AppContainer

统一内容宽度和响应式左右边距。页面区块外层使用，避免各页自行计算 gutter。

| Prop    | 类型                  | 默认值   | 说明                                           |
| ------- | --------------------- | -------- | ---------------------------------------------- |
| `as`    | `string`              | `'div'`  | 渲染的标签，如 `section`、`article`            |
| `width` | `'wide' \| 'content'` | `'wide'` | `wide` 最宽 1200；`content` 最宽 720，用于正文 |

```vue
<AppContainer as="section">
  <AppContainer width="content">正文</AppContainer>
</AppContainer>
```

### BaseTag

只读标签。用于笔记类型、主题标签和状态。

| Prop    | 类型                                       | 默认值      | 说明                                       |
| ------- | ------------------------------------------ | ----------- | ------------------------------------------ |
| `label` | `string`                                   | 必填        | 标签文字                                   |
| `state` | `'default' \| 'selected' \| 'in-progress'` | `'default'` | `in-progress` 使用状态色，只表达「进行中」 |

```vue
<BaseTag label="Python" />
<BaseTag label="智能体" state="selected" />
<BaseTag label="进行中" state="in-progress" />
```

标签是展示元素，不可点击；需要交互时使用 `TopicFilter`。

### BaseButton

按钮、站内链接和站外链接的统一外观。根据传入的 prop 选择元素：

- 有 `to`：渲染 `NuxtLink`。
- 有 `href`：渲染 `<a>`。
- 都没有：渲染 `<button>`。
- 其余属性通过 `v-bind="$attrs"` 透传。

| Prop      | 类型                              | 默认值      | 说明               |
| --------- | --------------------------------- | ----------- | ------------------ |
| `to`      | `string \| undefined`             | `undefined` | 站内路由           |
| `href`    | `string \| undefined`             | `undefined` | 站外或特殊链接     |
| `type`    | `'button' \| 'submit' \| 'reset'` | `'button'`  | 仅 `<button>` 生效 |
| `variant` | `'primary' \| 'secondary'`        | `'primary'` | 主次样式           |

```vue
<BaseButton to="/notes">阅读笔记 →</BaseButton>
<BaseButton
  variant="secondary"
  href="https://github.com"
  target="_blank"
  rel="noreferrer"
>
  GitHub ↗
</BaseButton>
<BaseButton variant="secondary" @click="toggleTheme">切换主题</BaseButton>
```

当前页或选中态通过属性表达，样式会自动跟随：

```vue
<BaseButton to="/notes" aria-current="page">笔记</BaseButton>
<BaseButton
  variant="secondary"
  :aria-pressed="selected"
  @click="select"
>筛选</BaseButton>
```

### BaseLink

正文中的文本链接。与 `BaseButton` 相同，按 `to` / `href` 选择元素。

| Prop    | 类型                  | 默认值      | 说明           |
| ------- | --------------------- | ----------- | -------------- |
| `to`    | `string \| undefined` | `undefined` | 站内路由       |
| `href`  | `string \| undefined` | `undefined` | 站外或特殊链接 |
| `muted` | `boolean`             | `false`     | 使用次要文字色 |

```vue
<BaseLink to="/about">了解这个示例</BaseLink>
<BaseLink href="/rss.xml" muted>RSS 订阅</BaseLink>
```

正文链接在 hover 时显示下划线；键盘聚焦时使用统一焦点环。

### TopicFilter

可切换的标签筛选项。按钮语义，不使用 `BaseTag`。

| Prop       | 类型      | 默认值  | 说明                          |
| ---------- | --------- | ------- | ----------------------------- |
| `label`    | `string`  | 必填    | 筛选项文字                    |
| `selected` | `boolean` | `false` | 是否选中，输出 `aria-pressed` |

| 事件     | 参数 | 说明                               |
| -------- | ---- | ---------------------------------- |
| `toggle` | 无   | 用户点击时触发，由页面切换筛选状态 |

```vue
<TopicFilter
  :label="tag"
  :selected="activeTags.includes(tag)"
  @toggle="toggleTag(tag)"
/>
```

### NoteCard

笔记目录和首页共用的卡片。整张卡片是一个链接。

| Prop      | 类型                    | 默认值      | 说明                   |
| --------- | ----------------------- | ----------- | ---------------------- |
| `to`      | `string`                | 必填        | 笔记详情路由           |
| `meta`    | `string`                | 必填        | 类型 + 日期等元信息    |
| `title`   | `string`                | 必填        | 笔记标题，渲染为 `h3`  |
| `summary` | `string`                | 必填        | 一句话结论             |
| `tags`    | `string[] \| undefined` | `undefined` | 标签列表，空数组不渲染 |

```vue
<NoteCard
  to="/notes/rag-loop"
  meta="实验记录 / 2026.11.03"
  title="用一个周末验证 RAG 的最小闭环"
  summary="从 Markdown 到向量检索，再到带引用回答。"
  :tags="['RAG', '实验']"
/>
```

卡片最小高度 336px，hover 叠加 `--color-surface-hover`。标题使用 `h3`，页面需要保证标题层级连续。

### EmptyState

目录筛选无结果、系列无内容等空状态。

| Prop          | 类型     | 默认值 | 说明                                |
| ------------- | -------- | ------ | ----------------------------------- |
| `eyebrow`     | `string` | `''`   | 等宽小字，如「当前筛选 / 0 篇笔记」 |
| `title`       | `string` | 必填   | 空状态标题，渲染为 `h2`             |
| `description` | `string` | `''`   | 说明文字                            |
| `actionLabel` | `string` | `''`   | 动作按钮文字；为空时不渲染按钮      |

| 事件     | 参数 | 说明               |
| -------- | ---- | ------------------ |
| `action` | 无   | 点击动作按钮时触发 |

```vue
<EmptyState
  eyebrow="当前筛选 / 0 篇笔记"
  title="还没有匹配的笔记。"
  description="试试其他标签，或者清除筛选。"
  action-label="清除所有筛选"
  @action="clearFilters"
/>
```

### SiteHeader

全局页头，包含站点标识、主导航和主题切换。

| Prop      | 类型                                        | 默认值      | 说明                                   |
| --------- | ------------------------------------------- | ----------- | -------------------------------------- |
| `current` | `'home' \| 'notes' \| 'about' \| undefined` | `undefined` | 当前页标识，输出 `aria-current="page"` |

```vue
<SiteHeader current="notes" />
```

页面接入后由布局统一渲染，页面不重复放置页头。

### SiteFooter

全局页脚，包含站点说明和 RSS 入口。RSS 指向 `/rss.xml`。无 props。

### ThemeToggle

主题切换按钮，内部使用 `useTheme`。无 props。

- 亮色主题下显示「暗色 ◐」，暗色主题下显示「浅色 ◑」，与设计稿一致。
- 图标是装饰性半圆 SVG；按钮的 `aria-label` 为「切换到暗色」或「切换到浅色」，保证可访问名称明确。
- 切换后即时更新文本和图标，避免可访问名称与实际主题不一致。
- 用户显式选择后写入 `localStorage` 的 `fieldnotes-theme`。

## 4. 布局

`app/layouts/default.vue` 是所有页面的默认骨架：

```text
跳到主要内容（首个可聚焦元素）
SiteHeader
main#main-content[tabindex="-1"]
  <slot />
SiteFooter
```

页面内容放在布局插槽内，并用 `AppContainer` 控制宽度：

```vue
<!-- app/app.vue 或页面组件 -->
<AppContainer width="content">
  <h1>页面标题</h1>
</AppContainer>
```

不要在其他组件中重复创建 `<header>`、`<main>` 或 `<footer>` 地标；页面内的 `<header>` 只用于区块引言。

## 5. 主题与颜色

- 颜色一律写 `var(--color-*)`，不要写十六进制、`rgb()` 或 `hsl()`。
- 亮暗值定义在 `app/assets/styles/_themes.scss`，两套主题使用相同 token 名。
- 主题偏好：`light` / `dark` / `system`，默认 `system`。
- 读取或修改主题使用 `useTheme()`：

```ts
const { preference, resolved, setPreference, toggle } = useTheme();
```

| 返回值                 | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `preference`           | 用户偏好，`light \| dark \| system`      |
| `resolved`             | 实际生效主题，`light \| dark`            |
| `setPreference(value)` | 设置并持久化偏好                         |
| `toggle()`             | 在亮色和暗色之间切换                     |
| `init()`               | 客户端初始化，插件已调用，页面不需要调用 |

需要强调色时只用 `--color-status`，并且只用于「进行中」状态。

## 6. 响应式

只使用预定义断点和 mixins，不写一次性媒体查询：

```scss
@use "../assets/styles/mixins" as mixins;
@use "../assets/styles/tokens" as tokens;

.grid {
  display: grid;
  grid-template-columns: 1fr;

  @include mixins.media-up(tokens.$breakpoint-tablet) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mixins.media-up(tokens.$breakpoint-desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

布局只在 768px 和 1024px 切换；1440px 是宽屏目标，不是切换点。

## 7. 可访问性约定

- 所有交互元素必须能用键盘到达，并有可见焦点：2px 焦点环 + 2px 间隔。
- 可点击控件最小高度 44px。
- 图标或符号按钮必须有 `aria-label`。
- 筛选状态用 `aria-pressed`，当前页用 `aria-current="page"`。
- 标题层级按页面结构连续，不跳级，不为了字号选择标题标签。
- 正文和控件文字对比度 ≥ 4.5:1，焦点环 ≥ 3:1，由 `npm run test` 校验。
- 新增颜色 token 后，必须同时更新 `_themes.scss`、`docs/design-tokens.md` 和对比度测试。

## 8. 修改流程

1. 视觉变更先在 Figma 确认；实现以设计稿为准。
2. 数值先进入 `_tokens.scss` 或 `_themes.scss`，再被组件引用。
3. 组件新增或修改后，更新本文的 props / 事件说明。
4. 运行完整检查：

```bash
cd frontend
npm run lint
npm run lint:styles
npm run format:check
npm run typecheck
npm run test
npm run build
```

5. 涉及主题或焦点的改动，需要同时在亮色和暗色下人工检查。

## 9. 已知临时项

- 搜索框是静态占位，没有对应组件。
- 上一页 / 下一页和长文条目组件已在设计稿中，尚未实现。
- 关于页和演示内容可以按自己的站点整体替换。
