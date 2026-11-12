# 设计交接：Tokens、组件与断点

本文是这个博客示例的设计 token 与组件尺寸约定。数值按页面和组件实际使用整理，token 名称由本项目定义，不绑定任何设计工具。

**实现位置**：`frontend/app/assets/styles/_tokens.scss`（编译期常量）与 `frontend/app/assets/styles/_themes.scss`（亮暗主题颜色）。组件的公开 API 与用法见 [design-system.md](design-system.md)。

**主题行为**：默认 `system`，跟随 `prefers-color-scheme`；用户切换后保存 `light` / `dark` 到 `localStorage` 的 `fieldnotes-theme`。`nuxt.config.ts` 的内联脚本在首屏前写入 `data-theme`，CSS 在无脚本时也提供系统暗色回退。

## 1. 命名规则

| 类别             | 实现方式          | 命名前缀                                    | 示例                 |
| ---------------- | ----------------- | ------------------------------------------- | -------------------- |
| 字体、字号、行高 | SCSS 预处理器变量 | `$font-` / `$text-`                         | `$text-body-size`    |
| 间距、圆角、描边 | SCSS 预处理器变量 | `$space-` / `$radius-` / `$border-`         | `$space-24`          |
| 断点、容器       | SCSS 预处理器变量 | `$breakpoint-` / `$container-` / `$gutter-` | `$breakpoint-tablet` |
| 主题颜色         | CSS 自定义属性    | `--color-`                                  | `--color-bg`         |

主题颜色不能只依赖 SCSS 变量：SCSS 在编译期求值，无法在运行时切换亮暗主题。颜色 token 必须输出为 CSS 自定义属性，并在 `:root` 与 `[data-theme="dark"]` 下分别赋值。

## 2. 颜色 tokens

| Token                                | 亮色                  | 暗色                     | 用途                                         |
| ------------------------------------ | --------------------- | ------------------------ | -------------------------------------------- |
| `--color-bg`                         | `#fafaf8`             | `#111316`                | 页面背景                                     |
| `--color-fg`                         | `#191b1d`             | `#f2f3f5`                | 标题、正文                                   |
| `--color-fg-muted`                   | `#5c6066`             | `#abb1bb`                | 摘要、元信息、说明                           |
| `--color-surface`                    | `#fff`                | `#181c21`                | 卡片背景                                     |
| `--color-surface-hover`              | `rgb(0 0 0 / 8%)`     | `rgb(255 255 255 / 8%)`  | 卡片 hover 叠色，叠加在 `--color-surface` 上 |
| `--color-border`                     | `#d8dadd`             | `#3b414a`                | 导航、页脚、卡片描边                         |
| `--color-tag-bg`                     | `#f0f1ef`             | `rgb(255 255 255 / 6%)`  | 标签底色                                     |
| `--color-tag-bg-selected`            | `rgb(0 0 0 / 18%)`    | `rgb(255 255 255 / 18%)` | 标签选中                                     |
| `--color-tag-fg`                     | `#5c6066`             | `#f2f3f5`                | 默认标签文字                                 |
| `--color-tag-border`                 | `#d8dadd`             | `rgb(255 255 255 / 12%)` | 默认/进行中标签描边                          |
| `--color-control-bg-primary`         | `rgb(0 0 0 / 18%)`    | `rgb(255 255 255 / 18%)` | 主按钮底色                                   |
| `--color-control-bg-primary-hover`   | `rgb(0 0 0 / 24%)`    | `rgb(255 255 255 / 24%)` | 主按钮 hover / selected hover                |
| `--color-control-bg-secondary`       | `#fff`                | `rgb(255 255 255 / 4%)`  | 次按钮底色                                   |
| `--color-control-bg-secondary-hover` | `rgb(0 0 0 / 10%)`    | `rgb(255 255 255 / 10%)` | 次按钮 hover                                 |
| `--color-control-border`             | `rgb(0 0 0 / 12%)`    | `rgb(255 255 255 / 12%)` | 主按钮、选中标签描边                         |
| `--color-control-border-subtle`      | `#d8dadd`             | `rgb(255 255 255 / 12%)` | 次按钮、筛选默认描边                         |
| `--color-focus-ring`                 | `rgb(0 0 0 / 72%)`    | `rgb(255 255 255 / 72%)` | `focus-visible` 外环                         |
| `--color-status`                     | `#245fad`             | `#a6c5ff`                | 「进行中」状态文字                           |
| `--color-status-bg`                  | `rgb(36 95 173 / 8%)` | `rgb(166 197 255 / 12%)` | 「进行中」状态底色                           |

说明：

- 设计稿 中部分颜色以黑色/白色 + 透明度绘制。实现时保留透明度（使用现代 `rgb()` 空格语法），不要预先合成为不透明色，否则 hover 叠色会失真。`--color-surface-hover` 是叠色层，使用时叠加在 `--color-surface` 上，而不是替换卡片底色。
- `--color-status` 是唯一允许的强调色，只用于「进行中」状态，不要扩散成通用链接色或按钮色。
- 亮色和暗色的 hover 值均已由组件给出；实现时不要自行推导。

## 3. 字体与字号

### 字体族

```scss
$font-sans: "Manrope Variable", "Noto Sans SC Variable", system-ui, sans-serif;
$font-mono:
  "Geist Mono Variable", ui-monospace, "SFMono-Regular", menlo, monospace;
```

- 英文与数字：Manrope
- 中文：Noto Sans SC
- 标签、代码、日期、等宽小字：Geist Mono
- 字重：`$font-weight-regular: 400`、`$font-weight-medium: 500`、`$font-weight-semibold: 600`、`$font-weight-bold: 700`
- 字体通过 `@fontsource-variable/*` 自托管并在构建时打包，不依赖 Google Fonts；因此浏览器使用同一套字体文件，不使用系统字体回退（除非字体加载失败）。变量字体的 family 名带 `Variable` 后缀。

### 字号阶梯

| 语义样式                                                | 字体                   | 字号 / 行高 | 字重                    | 用途             |
| ------------------------------------------------------- | ---------------------- | ----------- | ----------------------- | ---------------- |
| `$text-display-size` / `$text-display-line`             | Noto Sans SC           | 64 / 80     | `$font-weight-bold`     | 首页 Hero        |
| `$text-h1-page-size` / `$text-h1-page-line`             | Noto Sans SC           | 48 / 62     | `$font-weight-bold`     | 目录、关于页标题 |
| `$text-h1-article-size` / `$text-h1-article-line`       | Manrope + Noto Sans SC | 44 / 57     | `$font-weight-bold`     | 笔记详情标题     |
| `$text-h2-section-size` / `$text-h2-section-line`       | Noto Sans SC           | 32 / 40     | `$font-weight-medium`   | 首页区块标题     |
| `$text-h2-page-size` / `$text-h2-page-line`             | Noto Sans SC           | 32 / 42     | `$font-weight-medium`   | 关于页区块标题   |
| `$text-h2-article-size` / `$text-h2-article-line`       | Manrope + Noto Sans SC | 24 / 40     | `$font-weight-medium`   | 详情页章节标题   |
| `$text-subtitle-size` / `$text-subtitle-line`           | Noto Sans SC           | 22 / 36     | `$font-weight-medium`   | 关于页技能项     |
| `$text-card-title-size` / `$text-card-title-line`       | Manrope + Noto Sans SC | 20 / 30     | `$font-weight-semibold` | 笔记卡片标题     |
| `$text-logo-size` / `$text-logo-line`                   | Manrope                | 20 / 32     | `$font-weight-bold`     | 站点标识         |
| `$text-body-lg-size` / `$text-body-lg-line`             | Noto Sans SC           | 18 / 32     | `$font-weight-regular`  | 详情页正文       |
| `$text-body-lg-about-size` / `$text-body-lg-about-line` | Noto Sans SC           | 18 / 30     | `$font-weight-regular`  | 关于页简介       |
| `$text-body-md-size` / `$text-body-md-line`             | Noto Sans SC           | 16 / 26     | `$font-weight-regular`  | 空状态说明       |
| `$text-body-size` / `$text-body-line`                   | Noto Sans SC           | 14 / 22     | `$font-weight-regular`  | 卡片摘要、按钮   |
| `$text-label-size` / `$text-label-line`                 | Manrope / Noto Sans SC | 14 / 22     | `$font-weight-medium`   | 导航、按钮文字   |
| `$text-meta-size` / `$text-meta-line`                   | Geist Mono             | 12 / 19     | `$font-weight-regular`  | 日期、类型、标签 |
| `$text-code-size` / `$text-code-line`                   | Geist Mono             | 13 / 21     | `$font-weight-regular`  | 代码块           |

字距在组件中均为 `0`。中文标题不额外增加字距。每个语义样式在代码中拆为字号和行高两个变量，避免组件自行推导行高。

## 4. 间距、圆角、描边

```scss
// 组件内边距
$space-4: 4px;
$space-10: 10px;
$space-12: 12px;

// 间距阶梯
$space-8: 8px;
$space-16: 16px;
$space-24: 24px;
$space-32: 32px;
$space-48: 48px;
$space-64: 64px;
$space-96: 96px;

$radius-8: 8px;
$border-1: 1px;

$control-height: 44px;
$card-min-height: 336px;

$focus-ring-width: 2px;
$focus-ring-offset: 2px;
```

组件实测用法：

| 组件            | 内边距  | 间距 |
| --------------- | ------- | ---- |
| 笔记卡片        | 24      | 16   |
| 主/次按钮       | 10 / 16 | —    |
| 标签 Tag        | 4 / 8   | —    |
| 主题筛选        | 12 / 16 | —    |
| 搜索框          | 16      | 16   |
| 上一篇 / 下一篇 | 24      | 16   |

笔记卡片最小高度 336px；按钮和筛选控件的触控高度 44px。所有圆角均为 8。所有描边均为 1px，使用 `--color-border`、`--color-control-border`、`--color-control-border-subtle` 或 `--color-tag-border`。

焦点样式按设计规范页执行：`focus-visible` 为 2px 外环 + 2px 间隔，而不是直接使用 Focus 组件的边框宽度。设计稿 的 Focus 组件仅比默认态大 2px，无法表达 2px 环 + 2px 间隔，实现以规范页文字为准。

## 5. 断点与容器

| Token             | 值    | 视口 | 左右边距 | 内容宽度 | 卡片列数 |
| ----------------- | ----- | ---- | -------- | -------- | -------- |
| `$gutter-mobile`  | 24px  | 390  | 24       | 342      | 1        |
| `$gutter-tablet`  | 32px  | 768  | 32       | 704      | 2        |
| `$gutter-desktop` | 48px  | 1024 | 48       | 928      | 2        |
| `$gutter-wide`    | 120px | 1440 | 120      | 1200     | 3        |

```scss
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-wide: 1440px;

$container-mobile: 342px;
$container-tablet: 704px;
$container-desktop: 928px;
$container-wide: 1200px;

$content-width: 720px;
```

布局只在 768 和 1024 两个断点切换；1440 是宽屏目标，不是切换点。正文最大宽度 720px。

## 6. 组件与状态清单

设计稿中的组件按族归纳如下：

| 组件族        | 亮色变体                                                                | 暗色变体                      | 备注           |
| ------------- | ----------------------------------------------------------------------- | ----------------------------- | -------------- |
| Tag           | Default、Selected、InProgress                                           | Default、Selected、InProgress | 两套主题齐全   |
| Button        | Primary、Secondary、Focus、Hover、PrimaryHover、Selected、SelectedHover | 同亮色                        | 两套主题齐全   |
| Note card     | Note=01–06 × Default / Hover                                            | 同亮色                        | 两套主题齐全   |
| Topic filter  | Default、Selected、Hover、SelectedHover                                 | 同亮色                        | 两套主题齐全   |
| Search        | 页面内「站内搜索暂未开放」占位                                          | Default、Hover                | 当前示例不实现 |
| Adjacent note | Previous / Next × Default / Hover                                       | 同亮色                        | 两套主题齐全   |
| Build entry   | Row / Stack × RAG / Blog × Default / Hover                              | 同亮色                        | 两套主题齐全   |

状态要求：

- 默认、hover、focus-visible、selected（筛选和标签）、in-progress（状态标签）。
- 当前示例不需要 disabled 变体；搜索占位是静态不可用状态，不是组件 disabled。
- 空状态和 404 由页面级组件实现，不单独做 设计稿 组件。

## 7. 对比度验证

`frontend/tests/nuxt/tokens.spec.ts` 直接编译 `_themes.scss`，对亮暗两套 token 做 WCAG 对比度计算。运行 `npm run test` 即可复验，CI 也会执行。

验证口径：

- 正文、次要文字、标签文字、按钮文字和「进行中」状态文字：≥ 4.5:1（WCAG AA 普通文本）
- 焦点环与页面背景：≥ 3:1（WCAG AA 非文本对比度）
- 带透明度的 token 先按实际叠色合成，再计算对比度；卡片 hover 以 `--color-surface` 为底
- 导航、页脚和卡片的分隔描边按装饰性边界处理，不纳入文本对比度；控件文字和焦点状态仍按上面的指标验证。若后续要求控件轮廓本身也达到 3:1，需要回到 设计稿 调整 token

当前两套主题全部通过。该测试同时检查亮暗 token 集合一致、所有颜色可解析，以及组件和布局未硬编码颜色。

## 8. 已知缺口

以下是已标注、暂不阻塞实现的事项：

1. **搜索尚未实现**：目录页没有站内搜索，只有标签筛选。
2. **内容均为演示数据**：笔记、长文和关于页文案用于展示结构，公开使用前可以整体替换。
3. **404 与空状态没有独立设计稿**：按现有组件语言实现，共用基础组件。
4. **token 以本文为准**：没有绑定设计工具变量；修改时同步更新 `_tokens.scss`、`_themes.scss` 和本文。
