# Demo Notes

一个可运行的 Nuxt 4 博客示例：Markdown 内容存放在 Git 里，构建前校验，服务端读取后交给页面渲染。包含笔记目录、标签筛选、系列页、详情页、本地图片、亮暗主题、RSS、sitemap 和 404。

仓库只包含博客前端，不包含数据库、后台服务或 AI 助手。演示内容全部是示例数据，可以整体替换。

## 技术栈

- **框架**：Nuxt 4、Vue 3、Nitro、TypeScript
- **样式**：SCSS + CSS Modules，不使用 Tailwind
- **内容**：Markdown + YAML frontmatter，无 CMS、无数据库
- **校验**：Zod、gray-matter、js-yaml
- **测试**：Vitest、Playwright、axe
- **部署**：Docker 多阶段构建 + Caddy 反向代理示例

## 快速开始

要求 Node.js 24 和 npm。

```bash
cd frontend
npm install
npm run dev
```

打开 `http://localhost:3000`。`npm install` 会通过 `postinstall` 生成 Nuxt 类型。

生产构建：

```bash
cd frontend
npm run build
npm run preview
```

## 目录结构

```text
frontend/                     Nuxt 4 应用
  app/
    assets/styles/            SCSS tokens、亮暗主题与全局样式
    components/               基础组件与页面组件
    composables/              useNotes、useTheme
    layouts/                  默认布局（跳转链接、页头、主内容区、页脚）
    pages/                    首页、目录、详情、系列、关于
  server/api/                 笔记列表、详情与健康检查
  server/routes/              RSS、sitemap、内容图片资源
  server/utils/content.ts     Markdown 加载、校验、聚合与渲染
  scripts/validate-content.mjs 构建前内容校验
  tests/                      单元测试与对比度检查
  e2e/                        Playwright 端到端与 axe 可访问性测试
content/                      唯一写作源
  notes/                      短笔记，含一篇草稿和一篇本地图片笔记
  articles/demo-log/          3 篇演示长文与系列索引
docs/                         写作规范、设计系统与 tokens
infra/                        Docker Compose、Caddyfile 与通用环境变量示例
Dockerfile                    多阶段构建
```

`content/` 不属于 `frontend/`，构建和部署时直接读取。迁移内容只需要复制这个目录。

## 演示内容

| 类型 | 内容                                                   |
| ---- | ------------------------------------------------------ |
| 笔记 | 4 篇已发布：工具、仓库、实验、带本地图片的笔记         |
| 草稿 | `demo-draft.md`，`draft: true`，不出现在任何公开视图   |
| 系列 | `demo-log`，3 篇已发布长文                             |
| 索引 | `content/articles/demo-log/00-目录.md`，内容管线会跳过 |

公开视图共有 7 条内容；首页取最新 6 条。标签 `工具` 下有 2 篇已发布笔记。草稿仍参与构建前校验，但详情页和图片资源返回 404。

删除演示文件后，按 [docs/authoring.md](docs/authoring.md) 新建自己的笔记和系列即可。

## 常用命令

在 `frontend/` 下执行：

```bash
npm run dev              # 开发服务器
npm run build            # 生产构建；prebuild 先校验内容
npm run preview          # 预览生产构建
npm run content:validate # 只校验 content/ 的 frontmatter、日期和 slug
npm run typecheck        # 类型检查
npm run lint             # ESLint
npm run lint:styles      # Stylelint
npm run format           # Prettier 写入
npm run format:check     # Prettier 检查
npm test                 # Vitest 单元测试与对比度检查
npm run test:watch       # Vitest 监听模式
```

端到端与可访问性测试需要先生成生产产物并安装浏览器：

```bash
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:a11y
```

## 内容规则

- 必填 frontmatter：`title`、`summary`、`type`、`date`、`tags`；可选 `series`、`repo`、`website`、`draft`。
- 长文额外必填 `slug`，并且 `type: article`。
- 笔记 slug 由文件名或目录名决定，必须是小写 kebab-case。
- 带本地图片的笔记使用 `<slug>/index.md`，图片放在同目录下。
- `draft: true` 的内容仍会被校验，但不会进入目录、首页、标签、系列、RSS 或 sitemap。
- 构建前自动校验，失败会阻止构建。完整规则见 [docs/authoring.md](docs/authoring.md)。

## 主题与样式

- 设计 token 是唯一来源：编译期常量用 SCSS 变量，亮暗主题颜色用 CSS 自定义属性。
- 首次访问跟随 `prefers-color-scheme`；用户切换后保存到 `localStorage` 的 `fieldnotes-theme`。
- `nuxt.config.ts` 的内联脚本在首屏前写入 `data-theme`，避免主题闪烁。
- 组件 API 和样式约束见 [docs/design-system.md](docs/design-system.md)，数值见 [docs/design-tokens.md](docs/design-tokens.md)。

## 部署示例

`Dockerfile` 使用 `node:24-alpine` 做多阶段构建，运行阶段只保留 Nitro 产物和 `content/`。

```bash
cd infra
cp .env.example .env   # 填写 SITE_DOMAIN、SITE_URL、IMAGE_REPO 等
docker compose up -d --build
```

Caddy 会反向代理到应用的 `3000` 端口。生产环境必须设置 `NUXT_PUBLIC_SITE_URL`，用于 canonical、Open Graph、RSS 和 sitemap。

## 持续集成

`.github/workflows/ci.yml` 在推送到 `main` 或发起 PR 时运行：

- 内容校验
- ESLint、Stylelint、Prettier
- TypeScript 类型检查
- Vitest 单元测试与对比度检查
- 生产构建
- Playwright 端到端测试与 axe 可访问性检查

## 许可证

[MIT](LICENSE)
