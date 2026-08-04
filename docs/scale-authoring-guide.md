# 量表接入与维护说明

这份文档面向后续要继续为项目新增心理量表的人。  
当前项目是纯前端静态架构，没有后台“上传量表”页面。所谓“新增量表”，本质上是把题库、选项、计分规则和结果区间写进项目代码，然后重新部署。

## 1. 当前项目的数据结构

量表相关代码都在 `src/data/scales/` 目录下：

- `index.ts`
  - 量表总入口
  - 负责导出 `scales` 数组
  - 负责根据 `slug` 查找量表
- `types.ts`
  - 定义所有量表类型
- `presets.ts`
  - 放公共选项预设
  - 例如 0-3 频率题、1-7 人格题
- `template.ts`
  - 新增量表时可直接复制的模板
- `depression-checkin.ts`
  - 抑郁筛查示例
- `anxiety-checkin.ts`
  - 焦虑筛查示例
- `personality-profile.ts`
  - 多维人格画像示例
- `aas-r.ts`、`psqi.ts`、`scl90.ts`
  - 使用自定义计分器的 Word 量表示例

计分逻辑在：

- `src/lib/scoring.ts`

页面路由在：

- `src/app/scales/page.tsx`
  - 量表列表页
- `src/app/scales/[slug]/page.tsx`
  - 单份量表详情页
- `src/components/scale-experience.tsx`
  - 量表答题、结果展示、长图保存

## 2. 新增量表的标准流程

以后每次新增量表，按下面 6 步做：

1. 复制 `src/data/scales/template.ts`
2. 新建一个独立文件，例如 `src/data/scales/scl90.ts`
3. 按真实题库填写量表字段
4. 到 `src/data/scales/index.ts` 中导入并加入 `scales` 数组
5. 运行本地开发环境检查效果
6. 通过后重新部署

## 3. 一份量表必须包含哪些字段

每份量表都要符合 `ScaleDefinition` 结构：

```ts
export type ScaleDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: string;
  summary: string;
  intro: string;
  estimatedMinutes: number;
  scoringNote: string;
  kind: "sum" | "profile" | "mbti" | "custom";
  options: ScaleOption[];
  questions: ScaleQuestion[];
  bands?: ScaleBand[];
  dimensions?: ScaleDimension[];
  customScoringKey?: "aas" | "psqi" | "scl90";
  standardize?: "times-1.25-floor";
};
```

### 3.1 字段解释

#### `slug`

- 路由唯一标识
- 只能用英文、小写字母、数字、连字符
- 不能和其他量表重复
- 例子：`scl90`、`phq9`、`gad7`、`mbti-short`

量表详情页地址会自动变成：

```txt
/scales/你的-slug
```

#### `title`

- 量表完整标题
- 用于详情页主标题

#### `shortTitle`

- 量表简称
- 用于答题页顶部短标题

#### `subtitle`

- 简短描述
- 一般写题目数、计分形式、用途

例子：

```txt
50 题 / 总分评估 / 适合初筛
```

#### `category`

- 量表分类
- 例如：`情绪量表`、`人格量表`、`症状量表`

#### `summary`

- 列表页摘要
- 建议 1 到 2 句话

#### `intro`

- 答题前指导语
- 在正式开始测评前展示

#### `estimatedMinutes`

- 预计完成时间
- 数字类型
- 例子：`8`

#### `scoringNote`

- 计分说明
- 例如“总分越高说明近期困扰越明显”

#### `kind`

- `sum`
  - 总分型量表
  - 例如 PHQ-9、GAD-7、SDS、SAS
- `profile`
  - 多维画像型量表
  - 例如人格维度、多因子画像

#### `options`

- 当前题目使用的选项和分值
- 所有题默认复用这一组选项

#### `questions`

- 题目列表
- 每个题目必须有唯一 `id`
- 每个题目必须有 `text`

#### `bands`

- 只用于 `kind: "sum"`
- 定义总分落在哪个区间时显示什么结论

#### `dimensions`

- 只用于 `kind: "profile"`
- 定义各维度名称、说明和区间标签
- 如果原量表的维度区间是条目总分，可在维度上设置 `scoreMode: "sum"`；默认使用维度平均分

## 4. 题目选项怎么写

选项结构如下：

```ts
type ScaleOption = {
  label: string;
  detail: string;
  value: number;
};
```

例如 0-3 分频率题：

```ts
options: [
  { label: "从不", detail: "过去两周几乎没有出现", value: 0 },
  { label: "偶尔", detail: "出现过几天", value: 1 },
  { label: "经常", detail: "一周里反复出现", value: 2 },
  { label: "持续", detail: "几乎每天都在发生", value: 3 },
]
```

如果新量表沿用现有预设，优先复用 `presets.ts`：

- `frequencyOptions`
- `agreementOptions`

如果是新的计分体系，例如 1-5、0-4、1-4，都可以自己写一套新的 `options`。

## 5. 题目怎么写

题目结构如下：

```ts
type ScaleQuestion = {
  id: string;
  text: string;
  dimensionKey?: string;
  reverse?: boolean;
  options?: ScaleOption[];
  inputType?: "choice" | "time" | "duration" | "text";
};
```

### 5.1 最基础写法

```ts
questions: [
  { id: "scl90-1", text: "头痛。" },
  { id: "scl90-2", text: "神经过敏，心中不踏实。" },
]
```

### 5.2 反向计分题

如果某题是反向计分，直接加：

```ts
{ id: "abc-5", text: "我通常能很快放松下来。", reverse: true }
```

反向计分不需要你手动写公式。  
`src/lib/scoring.ts` 已经会根据当前选项分值范围自动反转。

例如：

- 0-3 会自动变成 `3 - 原分`
- 1-7 会自动变成 `8 - 原分`

### 5.3 多维量表题目

如果是多维量表，每一题都要指定 `dimensionKey`：

```ts
{ id: "tipi-1", text: "我通常外向、有活力。", dimensionKey: "extraversion" }
```

## 6. 总分型量表怎么写

适用于：

- PHQ-9
- GAD-7
- SDS
- SAS
- SCL-90 总均分/总分式结果

### 6.1 核心要点

- `kind` 必须是 `"sum"`
- 必须提供 `bands`
- `bands` 要覆盖所有可能的总分区间
- 如果 Word 规则要求先把原始总分乘以 `1.25` 并取整数，可设置 `standardize: "times-1.25-floor"`，结果页会同时保留原始总分。

### 6.2 示例

```ts
import type { ScaleDefinition } from "./types";

export const exampleScale: ScaleDefinition = {
  slug: "example-scale",
  title: "示例量表",
  shortTitle: "示例",
  subtitle: "50 题 / 总分评估",
  category: "症状量表",
  summary: "这里填写摘要。",
  intro: "这里填写指导语。",
  estimatedMinutes: 8,
  scoringNote: "总分越高，说明困扰越明显。",
  kind: "sum",
  options: [
    { label: "没有", detail: "完全没有", value: 1 },
    { label: "很轻", detail: "轻微", value: 2 },
    { label: "中等", detail: "中等", value: 3 },
    { label: "较重", detail: "较重", value: 4 },
    { label: "严重", detail: "严重", value: 5 },
  ],
  questions: [
    { id: "example-1", text: "这里是第 1 题。" },
    { id: "example-2", text: "这里是第 2 题。" },
  ],
  bands: [
    {
      min: 50,
      max: 99,
      label: "较低",
      emphasis: "当前分数处于较低区间。",
      summary: "总体症状负担较低。",
      recommendation: "结合访谈继续观察。",
    },
    {
      min: 100,
      max: 250,
      label: "较高",
      emphasis: "当前分数处于较高区间。",
      summary: "总体症状负担较明显。",
      recommendation: "建议进一步评估。",
    },
  ],
};
```

## 7. 多维量表怎么写

适用于：

- 人格画像
- 多因子心理特征量表
- 分维度统计的测验

### 7.1 核心要点

- `kind` 必须是 `"profile"`
- 必须提供 `dimensions`
- 每道题必须有 `dimensionKey`

### 7.2 示例

```ts
dimensions: [
  {
    key: "extraversion",
    name: "外向性",
    description: "反映个体在社交活力上的倾向。",
    bands: [
      { min: 1, max: 3.4, label: "偏内敛", summary: "更偏好低刺激互动。" },
      { min: 3.5, max: 5.2, label: "均衡", summary: "可在独处与社交间切换。" },
      { min: 5.3, max: 7, label: "偏外向", summary: "更容易从社交中获得能量。" },
    ],
  },
]
```

题目示例：

```ts
questions: [
  { id: "p-1", text: "我通常外向。", dimensionKey: "extraversion" },
  { id: "p-2", text: "我更愿意独处。", dimensionKey: "extraversion", reverse: true },
]
```

## 8. 自定义计分量表

如果计分依赖时间差、睡眠效率、多个因子组合等规则，不要把公式硬塞进普通总分区间。新增一个 `customScoringKey`，并在 `src/lib/scoring.ts` 中实现独立计分器，同时为边界值补充测试。

## 9. 如何把新量表接入系统

假设你新增了文件：

```txt
src/data/scales/scl90.ts
```

那么你要去 `src/data/scales/index.ts` 做两件事：

### 8.1 导入

```ts
import { scl90Scale } from "./scl90";
```

### 8.2 加入数组

```ts
export const scales = [
  depressionCheckinScale,
  anxietyCheckinScale,
  personalityProfileScale,
  scl90Scale,
];
```

做完后：

- `/scales` 列表页会自动出现它
- `/scales/scl90` 会自动生成页面

## 10. 本地检查流程

每次加完量表都执行：

```bash
npm run lint
npm run build
```

然后本地开发预览：

```bash
npm run dev
```

重点检查：

- 列表页是否显示标题、摘要、题数
- 路由能否正常打开
- 题目是否完整
- 选项分值是否正确
- 反向题是否已标记
- 最后一题提交后能否正确出结果
- 区间文案是否符合预期
- 长图导出是否正常

## 11. 常见错误

### 10.1 `slug` 重复

问题：

- 两份量表用了同一个 `slug`

结果：

- 路由冲突
- 构建或访问结果混乱

处理：

- 保证每份量表 `slug` 唯一

### 10.2 `bands` 区间没覆盖全

问题：

- 总分量表最大分比你写的区间大

结果：

- 高分可能落不到正确结果

处理：

- 计算清楚最小分和最大分
- 确保 `bands` 覆盖整个范围

### 10.3 反向题漏写

问题：

- 某题应反向计分，但没写 `reverse: true`

结果：

- 总分和结果偏差

处理：

- 录入时逐题核对原始量表说明

### 11.4 多维量表题目没写 `dimensionKey`

问题：

- 某一题没有归属维度

结果：

- 该题不会进入正确维度统计

处理：

- 多维量表每题都要写 `dimensionKey`

### 10.5 题目 `id` 重复

问题：

- 两道题用了相同 `id`

结果：

- 前端渲染和状态管理可能异常

处理：

- 每题 `id` 保持唯一
- 建议命名规则：`量表slug-序号`

## 12. 对 50 题左右量表的建议

如果你未来大部分量表都在 50 题左右，建议：

- 每份量表单独一个文件
- 题号严格按原量表顺序录入
- 如果是分因子量表，先把维度清单整理出来，再录题
- 录入完成后，手动做 2 次样本测试
  - 一次低分样本
  - 一次高分样本

这样最容易发现：

- 区间配错
- 反向题漏标
- 维度归属错误

## 13. 推荐的新增量表工作方式

最稳的方式不是边看 PDF 边手敲，而是先整理成表格，再转代码。

推荐顺序：

1. 先把原量表整理到 Excel
2. 确认每题题号、题干、选项分值、是否反向、所属维度
3. 再按模板写入项目
4. 跑一次 `lint` 和 `build`
5. 本地手测
6. 再部署

## 14. 如果以后想做真正的“上传量表”

当前项目没有后台上传能力。  
如果以后你想做到“非开发人员也能录入量表”，可以再加一层：

- 方案 A：JSON 文件导入
  - 仍然是静态站
  - 适合你自己维护
- 方案 B：做一个内部录入页，把表单导出成 JSON
  - 仍然可以不接数据库
- 方案 C：接一个极轻量 CMS
  - 更适合多人协作维护

但按现在这个阶段，最稳、最省事的方式还是：

- 一份量表一个文件
- 用模板复制
- 手动加入 `index.ts`

## 15. 最短操作版本

如果你只想记最短流程，就记这 4 步：

1. 复制 `src/data/scales/template.ts`
2. 新建 `src/data/scales/你的量表.ts`
3. 去 `src/data/scales/index.ts` 里导入并加入 `scales`
4. 跑 `npm run dev`、`npm run lint`、`npm run build`

到这里，一份新量表就接入完成了。
