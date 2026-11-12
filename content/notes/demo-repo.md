---
title: "Nuxt 4：从 Markdown 到页面的最短路径"
summary: "服务端读取内容，页面只消费结构化 JSON；博客需要的路由、SSR 和构建产物都能在一个工程里完成。"
type: repo
date: 2026-11-04
tags: ["仓库", "演示"]
repo: "https://github.com/nuxt/nuxt"
website: "https://nuxt.com"
draft: false
---

## 结论

这个示例用 Nuxt 4 同时承担页面渲染和服务端读取。对博客这种内容量不大、需要 SEO 的站点，SSR 加文件系统内容源是一条短链路：不需要数据库，也不需要单独的内容服务。

## 它解决什么问题

如果只用纯前端框架，Markdown 要么在构建时全部打包进客户端，要么在浏览器里请求静态文件。前者会让首屏体积随内容增长，后者会把内容加载暴露成多次请求。

Nuxt 的 Nitro 层可以在服务端读取 `content/`，把结果整理成 JSON，再交给页面。这样页面拿到的已经是结构化数据，不需要知道文件在哪里。

这个仓库本身包含完整的框架、路由、服务端路由和构建工具，适合先跑通再按需裁掉不需要的部分。

## 一次小实验

克隆后只启动前端：

```bash
cd frontend
npm install
npm run dev
```

打开 `http://localhost:3000`，然后直接访问接口：

```bash
curl -s http://localhost:3000/api/notes
```

返回值里有 `notes`、`tags` 和 `series` 三个字段。页面和接口读的是同一份内容，不存在两套数据源。

生产构建：

```bash
npm run build
npm run preview
```

产物在 `frontend/.output/`，可以直接用 Node 启动。

## 限制

Nuxt 的约定比手写 Vite 配置多，第一次接触需要理解 `app/`、`server/` 和自动导入。内容很多时，每次都全量读取文件也会变慢；这个示例没有做缓存，因为演示数据量很小。

SSR 还意味着部署需要 Node 运行时，不能只上传静态文件。如果站点完全不需要服务端逻辑，静态生成会更便宜。

## 适合谁

适合需要 SEO、内容在 Git 里、又不想维护数据库的个人站点。也适合作为前端工程师理解 SSR、服务端路由和内容管线的练习项目。
