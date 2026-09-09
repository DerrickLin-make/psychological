import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const mosSource = source(
  "original-study",
  "Sherbourne & Stewart：The MOS Social Support Survey",
  1991,
  "https://pubmed.ncbi.nlm.nih.gov/2035047/",
);

function supportFactor(key: string, name: string, construct: string, manifestations: string[], impact: string) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "percent",
    direction: "positive",
    limitations: descriptiveLimitations,
    sources: [mosSource],
    interpretation: "分数越高，表示本次作答中感知到的该类社会支持越充足；没有统一临床高低切点。",
    manifestations,
    impact,
    recommendations: ["把分数转化为具体支持计划，明确在不同情境下可以联系谁、提出什么请求。"],
  });
}

export const mosSocialExplanation: ScaleExplanation = {
  scaleSlug: "mos-social",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    "emotional-info": supportFactor("emotional-info", "情感与信息支持", "描述有人倾听、理解、提供建议和信息的可获得程度。", ["可能体现为遇到困扰时有人愿意听你说，也能提供有用的建议或信息。"], "充足的情感与信息支持有助于理解问题、调节情绪和作出决定。"),
    tangible: supportFactor("tangible", "实际帮助支持", "描述在生病、出行、做饭和家务等方面获得实际帮助的可能性。", ["可能体现为需要照料或处理具体事务时，有人能够提供可执行的帮助。"], "实际支持可以减少压力下的事务负担，帮助维持基本生活和恢复节奏。"),
    affectionate: supportFactor("affectionate", "情感亲密支持", "描述获得爱、关心、拥抱和被需要感的程度。", ["可能体现为有人表达关心、接纳和亲密，也让你感到自己对他人重要。"], "亲密支持有助于增强归属感和情绪安全感，但不应成为关系中唯一的支持来源。"),
    "positive-interaction": supportFactor("positive-interaction", "积极社交互动", "描述与他人放松、娱乐、共享愉快活动和转移注意力的机会。", ["可能体现为有人愿意一起休息、聊天、运动或做开心的事情。"], "积极互动可以提供恢复和情绪调节机会，帮助生活不被压力单一占据。"),
    overall: supportFactor("overall", "总体社会支持", "描述 2～20 题所涉及的总体功能性社会支持感知。", ["反映情感、信息、实际帮助、亲密和积极互动等支持的总体可获得感。"], "总体支持感较低时，压力应对和恢复可能更困难；网络数量与支持质量并不完全相同。"),
  },
  overall: {
    summary: "MOS 社会支持调查表描述你感知到的功能性社会支持，包括情感与信息、实际帮助、亲密支持和积极互动；亲密朋友与亲属数量是背景指标，不计入总体支持分。",
    recommendations: ["不要只增加联系人数量，优先识别能够提供具体倾听、建议、实际帮助或陪伴的人，并主动建立可使用的支持路径。"],
  },
  limitations: ["第 1 题的关系数量是背景指标，不能代表关系质量；本项目中文题干属于工作译文。", ...descriptiveLimitations],
  sources: [mosSource],
};
