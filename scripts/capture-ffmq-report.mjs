import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9323;
const reportUrl = process.env.MINDSCOPE_REPORT_URL ?? "http://localhost:3000/scales/ffmq-39/";
const viewportWidth = Number(process.env.MINDSCOPE_REPORT_WIDTH ?? 1920);
const outputPath = path.resolve(process.env.MINDSCOPE_REPORT_OUTPUT ?? "docs/design/mindscope-ffmq-report-1920.png");
const profilePath = await mkdtemp(path.join(tmpdir(), "mindscope-report-"));
const answers = JSON.parse(process.env.MINDSCOPE_REPORT_ANSWERS ?? "[2,3,1,2,1,2,3,2,2,1,2,3,2,2,2,3,2,2,2,2,2,3,2,2,2,1,3,2,1,2,1,2,1,2,2,1,2,2,2]");
const expectedText = process.env.MINDSCOPE_REPORT_EXPECTED_TEXT ?? "114";
const expectedDimensionCards = Number(process.env.MINDSCOPE_REPORT_EXPECTED_DIMENSIONS ?? 5);

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profilePath}`,
  "--disable-extensions",
  "--disable-gpu",
  "--hide-scrollbars",
  "about:blank",
], { stdio: "ignore", windowsHide: true });

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function debuggerUrl() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const tabs = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
      const page = tabs.find((tab) => tab.type === "page" && !tab.url.startsWith("chrome-extension://"));
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error("Chrome debugging endpoint did not start.");
}

try {
  const socket = new WebSocket(await debuggerUrl());
  const pending = new Map();
  let commandId = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function send(method, params = {}) {
    commandId += 1;
    return new Promise((resolve, reject) => {
      pending.set(commandId, { resolve, reject });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewportWidth,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: reportUrl });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(`location.href.startsWith(${JSON.stringify(reportUrl)}) && document.readyState === "complete"`)) break;
    await delay(100);
  }

  await evaluate(`(async () => {
    const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const buttonWithText = (text) => [...document.querySelectorAll("button")].find((button) => button.textContent?.includes(text));
    for (let attempt = 0; attempt < 100 && !buttonWithText("开始测评"); attempt += 1) await wait(50);
    const startButton = buttonWithText("开始测评");
    if (!startButton) throw new Error("Start button was not found at " + location.href + ": " + document.body.innerText.slice(0, 180));
    startButton.click();
    for (let attempt = 0; attempt < 100 && !document.querySelector("button.answer-option"); attempt += 1) await wait(50);
    const answers = ${JSON.stringify(answers)};
    for (const value of answers) {
      let button;
      for (let attempt = 0; attempt < 100 && !button; attempt += 1) {
        button = [...document.querySelectorAll("button.answer-option")]
          .find((item) => item.querySelector("strong")?.textContent?.trim() === String(value));
        if (!button) await wait(30);
      }
      if (!button) throw new Error("Answer button was not found.");
      button.click();
      await wait(80);
    }
    for (let attempt = 0; attempt < 100 && !document.querySelector(".clinical-report"); attempt += 1) await wait(50);
    await document.fonts.ready;
    window.scrollTo(0, 0);
    await wait(150);
    return document.body.innerText.includes("114") && document.body.innerText.includes("维度雷达图");
  })()`);

  const rendered = await evaluate(`document.body.innerText.includes(${JSON.stringify(expectedText)}) && document.querySelectorAll(".dashboard-dimension-card").length === ${expectedDimensionCards}`);
  if (!rendered) throw new Error("The expected report result was not rendered.");
  const layout = JSON.parse(await evaluate(`JSON.stringify({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    dimensionCards: document.querySelectorAll(".dashboard-dimension-card").length,
  })`));
  if (layout.scrollWidth > layout.clientWidth) throw new Error(`Horizontal overflow: ${layout.scrollWidth} > ${layout.clientWidth}`);

  const { contentSize } = await send("Page.getLayoutMetrics");
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
    clip: { x: 0, y: 0, width: viewportWidth, height: Math.ceil(contentSize.height), scale: 1 },
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
  console.log(`${outputPath} (${viewportWidth}x${Math.ceil(contentSize.height)}), no horizontal overflow, ${layout.dimensionCards} dimension cards`);
  socket.close();
} finally {
  chrome.kill();
  await delay(250);
  await rm(profilePath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {});
}
