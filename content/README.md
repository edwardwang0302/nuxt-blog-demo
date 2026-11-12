# 演示内容

这里的 Markdown 全部是演示数据，用来展示博客的内容管线。它们不对应任何真实项目记录，可以整体替换。

## 结构

```text
content/
  notes/                      短笔记
    demo-toolkit.md
    demo-repo.md
    demo-experiment.md
    demo-draft.md             草稿，不会进入公开视图
    demo-image/
      index.md                带本地图片的笔记
      images/pipeline.svg
  articles/
    demo-log/                 演示系列
      00-目录.md              系列索引，不参与渲染
      01-从文件开始.md
      02-读取与校验.md
      03-渲染与发布.md
```

## 草稿

`demo-draft.md` 使用 `draft: true`。它仍会参与构建前校验，但不会出现在目录、首页、标签、系列、RSS 或 sitemap 中。详情页和图片资源也会返回 404。

## 替换内容

删除这些演示文件，按 [写作与内容规范](../docs/authoring.md) 新建自己的笔记和系列即可。内容校验会阻止字段错误进入构建产物。
