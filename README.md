# MindScope

面向心理咨询机构的纯前端在线测评系统。

## 开发命令

```bash
npm run dev
npm run test
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

当前已接入 `量表word版/` 中的 12 份 Word 量表：AAS-R、PCL-5、PSQI、MBTI、NEO-FFI、婚姻调适、FAD、SDS、SAS、EPDS、SCL-90 和 BDI-II。原始 Word 文件仅作为本地来源保存，不会在网页端上传或收集答题记录。

详细维护文档见：

- `docs/scale-authoring-guide.md`

新增量表的最短流程：

1. 复制 `src/data/scales/template.ts`
2. 新建自己的量表文件
3. 在 `src/data/scales/index.ts` 中导入并加入 `scales`
4. 运行 `npm run dev`、`npm run lint`、`npm run build`
