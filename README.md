# MindScope

面向心理咨询机构的纯前端在线测评系统。

## 开发命令

```bash
npm run dev
npm run lint
npm run build
```

默认本地地址：

```txt
http://localhost:3000
```

## 主要页面

- `/`
  - 首页
- `/scales`
  - 量表列表页
- `/scales/[slug]`
  - 单份量表详情页

## 题库维护

量表数据在：

- `src/data/scales/`

详细维护文档见：

- `docs/scale-authoring-guide.md`

新增量表的最短流程：

1. 复制 `src/data/scales/template.ts`
2. 新建自己的量表文件
3. 在 `src/data/scales/index.ts` 中导入并加入 `scales`
4. 运行 `npm run dev`、`npm run lint`、`npm run build`
