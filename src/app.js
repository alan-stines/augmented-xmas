import { startCamera } from "./camera.js";
import { config } from "./config.js";
import { FrameAnalyzer } from "./frame-analyzer.js";
import { Renderer } from "./renderer.js";

const video = document.querySelector("#camera");
const canvas = document.querySelector("#output");
const startPanel = document.querySelector("#startPanel");
const startButton = document.querySelector("#startButton");
const statusText = document.querySelector("#status");
const controls = document.querySelector("#controls");
const debug = document.querySelector("#debug");

const inputs = {
  mirror: document.querySelector("#mirrorInput"),
  snowAmount: document.querySelector("#snowInput"),
  grade: document.querySelector("#gradeInput"),
  sparkleSensitivity: document.querySelector("#sparkleInput"),
  lights: document.querySelector("#lightsInput"),
  debug: document.querySelector("#debugInput"),
};

const renderer = new Renderer(canvas, video);
const analyzer = new FrameAnalyzer();
const state = {
  config,
  analysis: analyzer.snapshot(),
  time: 0,
  fps: 0,
};

let lastTime = performance.now();
let running = false;

bindControls();
drawIdleScene();

startButton.addEventListener("click", async () => {
  try {
    statusText.textContent = "Opening camera...";
    await startCamera(video);
    startPanel.classList.add("is-hidden");
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  } catch (error) {
    statusText.textContent =
      "Camera could not start. Use localhost and allow camera permission.";
    console.error(error);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "c") {
    controls.classList.toggle("is-open");
  }

  if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  }

  if (event.key === "Escape") {
    controls.classList.remove("is-open");
  }
});

document.querySelector("#hideControls").addEventListener("click", () => {
  controls.classList.remove("is-open");
});

function tick(now) {
  if (!running) return;

  const deltaSeconds = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  state.time += deltaSeconds;
  state.fps = Math.round(1 / Math.max(0.001, deltaSeconds));
  state.analysis = analyzer.analyze(video);
  renderer.render(state, deltaSeconds);
  renderDebug();
  requestAnimationFrame(tick);
}

function bindControls() {
  inputs.mirror.addEventListener("input", () => {
    config.mirror = inputs.mirror.checked;
  });

  for (const key of ["snowAmount", "grade", "sparkleSensitivity", "lights"]) {
    inputs[key].addEventListener("input", () => {
      config[key] = Number(inputs[key].value);
    });
  }

  inputs.debug.addEventListener("input", () => {
    config.debug = inputs.debug.checked;
    debug.classList.toggle("is-open", config.debug);
  });
}

function renderDebug() {
  if (!config.debug) return;
  debug.textContent = [
    `fps: ${state.fps}`,
    `brightness: ${state.analysis.brightness.toFixed(2)}`,
    `motion: ${state.analysis.motionLevel.toFixed(2)}`,
    `motion points: ${state.analysis.motionPoints.length}`,
    `canvas: ${canvas.width}x${canvas.height}`,
  ].join("\n");
}

function drawIdleScene() {
  renderer.resize();
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#07121a");
  gradient.addColorStop(1, "#020405");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  for (let i = 0; i < 140; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.8 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
}

window.addEventListener("resize", () => {
  if (!running) drawIdleScene();
});

