import { parseScl90Analysis, type Scl90Analysis, type Scl90AnalysisRequest } from "@/lib/scl90-report";

export async function requestScl90Analysis(request: Scl90AnalysisRequest): Promise<Scl90Analysis> {
  const endpoint = process.env.NEXT_PUBLIC_SCL90_ANALYSIS_URL
    || "https://test-6glfp5fs533622b5-1328853010.ap-shanghai.app.tcloudbase.com/api/scl90-analysis";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : `AI 分析请求失败（${response.status}）。`;
    throw new Error(message);
  }

  const analysis = parseScl90Analysis(payload);
  if (!analysis) {
    throw new Error("AI 返回的报告格式不完整，请稍后重试。");
  }
  return analysis;
}
