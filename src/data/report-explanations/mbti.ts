import type { ScaleExplanation } from "./types";
import { bandedFactor, descriptiveLimitations, profileExplanation, profileValue, source } from "./shared";

const mbtiSource = source(
  "official",
  "Myers & Briggs：MBTI 偏好与类型框架官方基础资料",
  1962,
  "https://www.myersbriggs.org/",
);

const axisDefinitions = [
  { key: "EI", left: "E", right: "I", name: "外向－内向", construct: "描述注意力和能量更常从外部互动还是内部思考中获得。", leftLabel: "外向偏好", rightLabel: "内向偏好", leftMeaning: "更常从互动、行动和外部交流中整理想法或恢复能量。", rightMeaning: "更常通过独处、内部思考和少量深入交流整理想法或恢复能量。" },
  { key: "SN", left: "S", right: "N", name: "实感－直觉", construct: "描述获取信息时更偏好具体事实还是可能性、联系和抽象图景。", leftLabel: "实感偏好", rightLabel: "直觉偏好", leftMeaning: "更重视可观察的事实、经验、细节和当前可执行的信息。", rightMeaning: "更关注可能性、模式、概念联系和未来方向。" },
  { key: "TF", left: "T", right: "F", name: "思考－情感", construct: "描述作决定时更常优先考虑逻辑一致性还是价值与关系影响。", leftLabel: "思考偏好", rightLabel: "情感偏好", leftMeaning: "更倾向先比较原则、证据、因果和一致性，再作出判断。", rightMeaning: "更倾向先考虑价值、他人感受、关系和具体人的需要，再作出判断。" },
  { key: "JP", left: "J", right: "P", name: "判断－感知", construct: "描述面对生活安排时更偏好确定结构还是保留弹性和开放选项。", leftLabel: "判断偏好", rightLabel: "感知偏好", leftMeaning: "更喜欢计划、结构、明确决定和按步骤推进。", rightMeaning: "更喜欢灵活、探索、临场调整和保留选择空间。" },
] as const;

const axisProfiles = {
  E: profileValue({ key: "E", label: "外向偏好", interpretation: "注意力和能量更容易被外部互动、行动和交流激活。", manifestations: ["可能更愿意主动发起交流，在讨论或行动中形成想法。"], impact: "适合把沟通和协作作为推进任务的一部分，也需要留意社交过载。", recommendations: ["根据任务需要安排互动与独处，不把偏好当作社交能力的绝对判断。"] }),
  I: profileValue({ key: "I", label: "内向偏好", interpretation: "注意力和能量更容易通过内部思考、独处和深入交流恢复。", manifestations: ["可能先在心里整理，再选择少量、较深入的交流。"], impact: "适合保留准备和独立工作的时间，也需要主动维持重要的沟通连接。", recommendations: ["提前准备需要表达的重点，并为恢复精力保留合适的独处时间。"] }),
  S: profileValue({ key: "S", label: "实感偏好", interpretation: "更容易从事实、经验、细节和当前可执行信息中建立判断。", manifestations: ["可能关注具体步骤、已验证的方法和实际结果。"], impact: "有助于落实细节和稳定执行，也可以有意识地留出探索新可能的空间。", recommendations: ["在核对事实的同时，定期问自己还有哪些可能性或长期影响。"] }),
  N: profileValue({ key: "N", label: "直觉偏好", interpretation: "更容易从模式、联系、概念和未来可能性中建立判断。", manifestations: ["可能先捕捉整体方向和潜在意义，再补充具体细节。"], impact: "有助于提出方向和新想法，也需要用事实、步骤和反馈检验设想。", recommendations: ["把想法转成可验证的小步骤，避免只停留在概念和可能性。"] }),
  T: profileValue({ key: "T", label: "思考偏好", interpretation: "作决定时更容易优先比较逻辑、原则、证据和一致性。", manifestations: ["可能直接分析问题，重视标准和可解释的理由。"], impact: "有助于结构化决策和发现问题，也需要明确表达对人的影响与情绪信息。", recommendations: ["在说明理由后补充对方感受、关系和实施成本的考虑。"] }),
  F: profileValue({ key: "F", label: "情感偏好", interpretation: "作决定时更容易优先考虑价值、关系和具体人的感受与需要。", manifestations: ["可能先理解人的处境，再权衡方案是否符合重要价值。"], impact: "有助于建立共情和合作，也需要保留事实、边界和一致性检查。", recommendations: ["在照顾关系的同时，明确标准、资源和不能承担的边界。"] }),
  J: profileValue({ key: "J", label: "判断偏好", interpretation: "更容易通过计划、结构和明确决定获得推进感。", manifestations: ["可能喜欢提前安排、拆解任务并按计划完成。"], impact: "有助于执行和降低不确定性，也需要为变化和临时信息保留弹性。", recommendations: ["计划中预留缓冲，并定期检查计划是否仍适合当前事实。"] }),
  P: profileValue({ key: "P", label: "感知偏好", interpretation: "更容易通过探索、灵活调整和保留选项获得推进感。", manifestations: ["可能边做边收集信息，根据现场变化调整路径。"], impact: "有助于适应变化和发现机会，也需要用明确的最小截止点避免拖延。", recommendations: ["为开放探索设定决策节点，把灵活性转化为可完成的下一步。"] }),
};

const typeNames: Record<string, [string, string]> = {
  ISTJ: ["物流师型", "可靠、务实、重视秩序与责任"],
  ISFJ: ["守卫者型", "细致、体贴、重视稳定与照顾"],
  INFJ: ["提倡者型", "重视意义、洞察关系并坚持价值"],
  INTJ: ["建筑师型", "独立、善于规划并关注长期系统"],
  ISTP: ["鉴赏家型", "灵活、务实、擅长分析和解决问题"],
  ISFP: ["探险家型", "温和、敏感、重视体验与个人价值"],
  INFP: ["调停者型", "理想、共情、重视内在价值与可能性"],
  INTP: ["逻辑学家型", "好奇、分析、喜欢理解复杂原理"],
  ESTP: ["企业家型", "行动导向、灵活、关注现实结果"],
  ESFP: ["表演者型", "热情、友好、善于带动当下体验"],
  ENFP: ["竞选者型", "热情、想象丰富、善于连接可能性"],
  ENTP: ["辩论家型", "机敏、好奇、喜欢挑战和创新方案"],
  ESTJ: ["总经理型", "直接、务实、重视效率与组织推进"],
  ESFJ: ["执政官型", "合作、负责、关注关系与共同秩序"],
  ENFJ: ["主人公型", "热情、善于理解他人并促进成长"],
  ENTJ: ["指挥官型", "果断、系统、关注目标和资源整合"],
};

const typeProfiles = Object.fromEntries(
  Object.entries(typeNames).map(([code, [label, shortDescription]]) => [code, profileValue({
    key: code,
    label,
    interpretation: `本次四组偏好组合为 ${code}，固定画像强调${shortDescription}。`,
    manifestations: [`在熟悉情境中，可能更常以${shortDescription}的方式处理信息、决定和行动。`, "具体表现仍会受到成长经历、角色要求、训练和当前环境影响。"],
    impact: "这类画像可以帮助整理偏好的工作和沟通方式，但不能直接决定能力、职业适配或人际质量。",
    recommendations: ["把画像当作偏好假设，与真实行为和他人反馈核对；在需要时刻意练习相反偏好的策略。"],
  })]),
);

function axisFactor(axis: typeof axisDefinitions[number]) {
  return bandedFactor({
    key: axis.key,
    name: axis.name,
    construct: axis.construct,
    scoreUnit: "count",
    direction: "descriptive",
    limitations: descriptiveLimitations,
    sources: [mbtiSource],
    manifestations: ["结果表示四组偏好中的相对方向，不表示能力高低或人格优劣。"],
    impact: "偏好可能影响信息获取、决策、沟通和计划方式，但情境要求可以让人使用另一侧策略。",
    bands: [
      { key: `winner-${axis.left}`, label: axis.leftLabel, interpretation: axis.leftMeaning, recommendations: ["保留该偏好的优势，同时练习理解和使用另一侧的信息或行动方式。"] },
      { key: `winner-${axis.right}`, label: axis.rightLabel, interpretation: axis.rightMeaning, recommendations: ["保留该偏好的优势，同时练习理解和使用另一侧的信息或行动方式。"] },
    ],
  });
}

export const mbtiExplanation: ScaleExplanation = {
  scaleSlug: "mbti",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: Object.fromEntries(axisDefinitions.map((axis) => [axis.key, axisFactor(axis)])),
  profiles: {
    axes: profileExplanation({
      key: "axes",
      name: "四组偏好画像",
      construct: "对四组 MBTI 偏好方向的文字化呈现。",
      values: axisProfiles,
      limitations: descriptiveLimitations,
      sources: [mbtiSource],
    }),
    type: profileExplanation({
      key: "type",
      name: "16 型画像",
      construct: "将四组偏好组合为一个便于阅读的类型代码和固定画像。",
      values: typeProfiles,
      limitations: ["类型代码是偏好组合，不是能力、职业适配或心理健康诊断。", ...descriptiveLimitations],
      sources: [mbtiSource],
    }),
  },
  overall: {
    summary: "MBTI 结果由外向－内向、实感－直觉、思考－情感、判断－感知四组偏好组成，并提供对应的 16 型描述性画像。",
    recommendations: ["把偏好当作自我观察和沟通线索，不用类型给自己或他人贴固定标签；实际行为可以训练和调整。"],
  },
  limitations: ["本报告采用 MBTI 框架的中文工作译文和项目自测实现，不能替代授权 MBTI 测评或职业、临床评估。", ...descriptiveLimitations],
  sources: [mbtiSource],
};
