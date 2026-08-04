import type { ScaleDefinition } from "./types";
import { q, sumBands } from "./common";

const bdiOptions = (items: string[]) => items.map((detail, value) => ({ label: String(value), detail, value }));

export const bdiScale: ScaleDefinition = {
  slug: "bdi-ii",
  title: "贝克抑郁量表（BDI-II）",
  shortTitle: "BDI-II",
  subtitle: "21 组 / 最近 2 周 / 抑郁症状程度",
  category: "情绪与抑郁",
  summary: "贝克抑郁自评量表（BDI-II）是抑郁自评量表中最著名的量表之一，被广泛运用于抑郁心理测试筛查。整个抑郁症测试量表包括21组题目，每组有4句陈述，测试者可根据自己最近2周的感受情况选择最符合自己的选项陈述，通过抑郁测试就可以快速了解自己是否存在抑郁以及抑郁程度如何。",
  intro: "请仔细阅读每条测试项目，务必把意思弄明白理解清楚，然后根据最近2周的实际感觉，选择最符合自己的选项陈述。",
  estimatedMinutes: 10,
  scoringNote: "每题为0-3分制，请选择最符合自己最近2周感受的选项。",
  kind: "sum",
  options: bdiOptions(["","","",""]),
  questions: [
  q("bdi-1", "悲伤", bdiOptions(["我不感到悲伤", "我经常感到悲伤", "我一直感到悲伤", "我太悲伤或太难过，到了难以忍受程度"])),
  q("bdi-2", "悲观", bdiOptions(["我没有对未来失去信心", "我比以往更加对未来没有信心", "我感到前景黯淡", "我觉得将来毫无希望，并且只会变得更加糟糕"])),
  q("bdi-3", "过去失败", bdiOptions(["我不觉得自己是个失败者", "我的失败比较多", "回首往事，我看到一大堆的失败", "我觉得自己是一个彻底的失败者"])),
  q("bdi-4", "快感丧失", bdiOptions(["我和过去一样能从喜欢的事情中得到乐趣", "我不能像过去一样从喜欢的事情中得到乐趣", "我从过去喜欢的事情中获得的快乐很少", "我完全不能从过去喜欢的事情中获得快乐"])),
  q("bdi-5", "内疚感", bdiOptions(["我没有特别的内疚感", "我对自己做过或该做但没做的许多事感到内疚", "在大部分时间里我都感到内疚", "我任何时候都感到内疚"])),
  q("bdi-6", "惩罚感", bdiOptions(["我没觉得自己在受惩罚", "我觉得自己可能会受到惩罚（自我感觉可能会但是未发生）", "我觉得自己会受到惩罚（自我感觉确定会但是未发生）", "我觉得正在受到惩罚（自我感觉已经发生）"])),
  q("bdi-7", "自我厌恶", bdiOptions(["我对自己的感觉同过去一样", "我对自己失去了信心", "我对自己感到失望", "我讨厌我自己"])),
  q("bdi-8", "自我批评", bdiOptions(["与过去相比，我没有更多的责备或批评自己", "我比过去责备自己更多", "只要我有过失，我就责备自己", "只要发生不好的事情，我就责备自己"])),
  q("bdi-9", "自杀念头", bdiOptions(["我没有任何自杀的想法", "我有自杀的想法，但我不会去做", "我想自杀", "如果有机会我就会自杀"])),
  q("bdi-10", "哭泣", bdiOptions(["和过去比较，我最近哭或想要哭的次数没有增加多少", "和过去比较，我最近比过去哭或想要哭的次数增加了一些", "和过去比较，最近任何小事都会让我哭或想要哭", "和过去比较，最近我一直特别想要哭，但却又哭不出来"])),
  q("bdi-11", "激惹/烦躁", bdiOptions(["我现在没有比过去更加烦躁", "我现在比过去更容易烦躁", "我最近非常烦躁或不安，很难保持安静", "我非常烦躁不安，必须不停走动或做事情"])),
  q("bdi-12", "兴趣丧失", bdiOptions(["我对其他人或活动没有失去兴趣", "和过去相比，我对其他人或事的兴趣减少了", "我失去了对其他人或事的大部分兴趣", "现在任何事情都很难引起我的兴趣"])),
  q("bdi-13", "犹豫不决", bdiOptions(["我现在能和过去一样作决定（不会犹豫）", "我现在作决定比以前困难（轻度犹豫）", "我作决定比以前困难了很多（中度犹豫）", "我现在作任何决定都很困难（重度犹豫）"])),
  q("bdi-14", "无价值感", bdiOptions(["我不觉得自己没有价值", "我认为自己不如过去有价值或有用了", "我觉得自己不如别人有价值", "我觉得自己毫无价值"])),
  q("bdi-15", "精力不足", bdiOptions(["我和过去一样有精力", "我不如从前有精力", "我做很多事情都感到没有精力", "我做任何事情都感到没有精力"])),
  q("bdi-16", "睡眠变化", bdiOptions(["我没觉得睡眠有什么变化", "我的睡眠比过去略少，或略多", "我的睡眠比以前少了很多，或多了很多", "我根本无法睡觉，或我一直想睡觉"])),
  q("bdi-17", "易激惹", bdiOptions(["我并不比过去容易发火", "与过去相比，我比较容易发火", "与过去相比，我非常容易发火", "我现在随时都很容易发火"])),
  q("bdi-18", "食欲变化", bdiOptions(["我没觉得食欲有什么变化", "我的食欲比过去略差，或略好", "我的食欲比过去差了很多，或好很多", "我完全没有食欲，或总是非常想吃东西"])),
  q("bdi-19", "注意力难以集中", bdiOptions(["我和过去一样可以集中精神", "我无法像过去一样集中精神", "任何事情都很难让我长时间集中精神", "任何事情都无法让我集中精神（短时间也无法集中精神）"])),
  q("bdi-20", "疲劳", bdiOptions(["我没觉得比过去累或乏力", "我比过去更容易累或乏力", "因为太累或者太乏力，很多过去常做的事情不能做了", "因为太累或者太乏力，几乎全部过去常做的事情都不能做了"])),
  q("bdi-21", "性兴趣丧失", bdiOptions(["和过去比较，我现在对性的兴趣和以前一样没有什么变化", "和过去比较，我现在对性的兴趣比过去降低了", "和过去比较，我现在对性的兴趣大大下降", "和过去比较，我现在对性的兴趣已经完全丧失"])),
  ],
  bands: sumBands([
    [0, 13, "lower", "possible minimal depression", "The document describes 0-13 as possible no depression.", "Continue observing your emotional state."],
    [14, 19, "mild", "possible mild depression", "The document describes 14-19 as possible mild depression.", "Consider professional support if symptoms persist."],
    [20, 28, "moderate", "possible moderate depression", "The document describes 20-28 as possible moderate depression.", "Consider professional evaluation."],
    [29, 63, "severe", "possible severe depression", "The document describes 29-63 as possible severe depression.", "Seek professional evaluation."],
  ]),
};
