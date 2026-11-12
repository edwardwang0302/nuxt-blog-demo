# 写作与内容规范

`content/` 是站点唯一的内容源。前端构建时直接读取，不复制到 `frontend/`。迁移或恢复时，复制整个 `content/` 目录即可。

## 1. 目录与文件命名

```text
content/
  notes/
    demo-toolkit.md             # 单文件笔记，slug = demo-toolkit
    demo-image/                 # 带本地图片的笔记使用目录形式
      index.md                  # slug = demo-image
      images/pipeline.svg
  articles/
    demo-log/
      00-目录.md                # 系列索引，不参与渲染
      01-从文件开始.md          # slug 由 frontmatter 的 slug 字段指定
      02-读取与校验.md
      03-渲染与发布.md
```

- 笔记放在 `content/notes/`，只扫描一级 `.md` 文件和一级目录下的 `index.md`。
- 长文放在 `content/articles/<系列>/`，只扫描一级 `.md` 文件；`00-目录.md` 是系列索引，会被跳过。
- 笔记的 slug 由文件名或目录名决定，不写在 frontmatter 中；长文必须在 frontmatter 中声明 `slug`。
- slug 必须是小写 kebab-case：只允许 `a-z`、`0-9` 和连字符，例如 `demo-toolkit`、`demo-log-01`。
- slug 必须唯一。同时存在 `foo.md` 和 `foo/index.md` 会阻止构建。
- 笔记带本地图片时使用目录形式；单文件笔记不引用本地图片。

## 2. Frontmatter 字段

文档开头必须是 YAML frontmatter。

| 字段      | 必填     | 类型                                          | 说明                                  |
| --------- | -------- | --------------------------------------------- | ------------------------------------- |
| `title`   | 是       | string                                        | 标题，非空                            |
| `summary` | 是       | string                                        | 一句话结论，用于卡片和 SEO 描述       |
| `type`    | 是       | `tool` \| `repo` \| `experiment` \| `article` | 工具、仓库、实验或长文                |
| `date`    | 是       | `YYYY-MM-DD`                                  | 发布日期，必须是有效日历日期          |
| `tags`    | 是       | string[]                                      | 至少一个标签，标签不能重复            |
| `series`  | 否       | string                                        | 系列名，例如 `demo-log`               |
| `repo`    | 否       | URL                                           | 相关仓库链接                          |
| `website` | 否       | URL                                           | 相关官网链接                          |
| `draft`   | 否       | boolean                                       | 默认 `false`；`true` 时不进入公开视图 |
| `slug`    | 长文必填 | string                                        | 小写 kebab-case；笔记不要填写         |

未知字段会被拒绝，用来发现拼写错误。字段值不要留空字符串。

### 模板

```yaml
---
title: "演示标题"
summary: "一句话结论。"
type: tool
date: 2026-11-02
tags: ["工具", "演示"]
repo: "https://github.com/nuxt/nuxt"
website: "https://nuxt.com"
series: "demo-log"
draft: false
---
```

`type` 的含义：

| 值           | 用途               | 典型长度             |
| ------------ | ------------------ | -------------------- |
| `tool`       | 工具或流程速览     | 300-1000 字          |
| `repo`       | GitHub 仓库速览    | 300-1000 字          |
| `experiment` | 小型实验或踩坑记录 | 300-800 字           |
| `article`    | 系列长文           | 不限，按五段结构组织 |

## 3. 正文

- 笔记正文使用 Markdown，建议 300-1000 字；`article` 长文不受此长度限制。
- 每篇必须包含至少一个可复现的实验：命令、代码片段、运行输出或截图。
- 结论放在开头或 `summary`，正文补充依据、实验和限制。
- 标题从 `##` 开始使用；页面会渲染内容标题，正文不要再写 `#` 一级标题。
- 支持 Markdown 链接、列表、引用、代码块和表格；正文中的原始 HTML 默认不渲染。

## 4. 本地图片

带图片的笔记使用目录形式：

```text
content/notes/demo-image/
  index.md
  images/pipeline.svg
```

正文中用相对路径引用：

```md
![内容管线示意图](./images/pipeline.svg)
```

- 相对路径以 `index.md` 所在目录为基准，不能使用 `..` 跳出笔记目录。
- 长文图片相对长文文件所在目录引用，构建后地址为 `/content-assets/articles/<slug>/<path>`。
- 笔记图片构建后地址会改写为 `/content-assets/notes/<slug>/<path>`。
- 允许的扩展名：`.avif`、`.gif`、`.jpeg`、`.jpg`、`.png`、`.svg`、`.webp`。
- 外部图片直接用完整 `https://` 地址。
- 图片与笔记一起提交，迁移时随 `content/` 目录一起备份。

图片由 Nitro 在运行时读取。部署时 `content/` 必须存在于镜像或挂载卷中，默认路径为仓库根 `content/`，可用 `NUXT_CONTENT_DIR` 覆盖。

## 5. 系列

- 同一 `series` 值的笔记和长文自动归入一个系列。
- 系列内按 `date` 升序排列，适合有先后顺序的构建记录。
- 系列名保持稳定；改名会让历史文章脱离原系列。
- 演示系列使用 `series: 'demo-log'`，系列页地址是 `/notes/series/demo-log`。

## 6. 草稿

- 发布前未完成的内容写 `draft: true`。
- `draft: true` 的内容不会出现在笔记目录、首页、标签、系列、RSS 和站点地图中。
- 草稿仍会被校验。字段错误会阻止构建，避免以后发布时才发现问题。
- 本地预览想看草稿时，把 `draft` 改为 `false`，不要绕过校验。
- `demo-draft.md` 是现成的草稿示例。

## 7. 校验与构建

内容校验在 `npm run build` 前自动执行：

```bash
cd frontend
npm run content:validate   # 只校验内容
npm run build              # prebuild 先校验，失败则停止构建
```

校验失败会一次列出所有问题，并给出文件路径：

```text
内容校验失败（2 项）：
- notes/broken.md: type: 类型必须是 tool、repo、experiment 或 article
- notes/2026-02-30.md: date: 日期不是有效日期
```

校验范围：

- 必填字段存在且类型正确
- `type` 取值合法
- `date` 是 `YYYY-MM-DD` 且是有效日期
- `tags` 非空且不重复
- `repo` / `website` 是有效 URL
- slug 符合 kebab-case
- slug 不重复，笔记和长文共用同一 slug 空间
- 长文必须提供 `slug` 且 `type: article`；笔记不得写 `slug` 或使用 `article` 类型
- 未知 frontmatter 字段

## 8. 新增一篇笔记

1. 在 `content/notes/` 新建 `<slug>.md`，或 `<slug>/index.md`。
2. 填入完整 frontmatter 和正文。
3. 在正文中加入至少一个可复现的实验。
4. 运行 `npm run content:validate`。
5. 运行 `npm run dev`，检查 `/notes` 和 `/notes/<slug>`。
6. 提交 Markdown 和图片；提交信息建议遵循 Conventional Commits。

## 9. 新增一篇长文

1. 在 `content/articles/<系列>/` 新建 `.md` 文件；文件名只用于排序，URL 由 frontmatter 的 `slug` 决定。
2. 填写 `type: article`、`slug`、`series` 和其余必填字段；未完成时写 `draft: true`。
3. 按「结论 → 问题 → 实验 → 坑和限制 → 适合谁」组织正文。
4. 运行 `npm run content:validate`，确认长文与笔记没有 slug 冲突。
5. 发布后确认长文出现在 `/notes`、`/notes/series/<系列>`、RSS 和 sitemap 中。
6. `00-目录.md` 作为系列索引维护，不参与构建。

## 10. 内容边界

- `content/articles/` 按主题分目录，目录名可以带编号；演示目录为 `demo-log/`。
- 演示文章、图片和关于页文案都是示例数据，可以整体替换。
- 不要把密钥、服务器地址或未公开的个人信息写进笔记或图片。
