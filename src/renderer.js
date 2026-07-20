import { FrostAndGradeEffect } from "./effects/frost.js";
import { GarlandLightsEffect } from "./effects/lights.js";
import { SnowfallEffect } from "./effects/snow.js";
import { MotionSparkleEffect } from "./effects/sparkles.js";

export class Renderer {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.effects = [
      new FrostAndGradeEffect(),
      new GarlandLightsEffect(),
      new MotionSparkleEffect(),
      new SnowfallEffect(),
    ];
  }

  resize() {
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(window.innerWidth * scale));
    const height = Math.max(1, Math.floor(window.innerHeight * scale));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  render(state, deltaSeconds) {
    this.resize();
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      drawCoverVideo(ctx, this.video, width, height, state.config.mirror);
    } else {
      ctx.fillStyle = "#05080a";
      ctx.fillRect(0, 0, width, height);
    }

    for (const effect of this.effects) {
      try {
        effect.render(ctx, width, height, deltaSeconds, state);
      } catch (error) {
        console.error(`${effect.constructor.name} failed`, error);
      }
    }
  }
}

function drawCoverVideo(ctx, video, width, height, mirror) {
  const videoWidth = video.videoWidth || width;
  const videoHeight = video.videoHeight || height;
  const scale = Math.max(width / videoWidth, height / videoHeight);
  const drawWidth = videoWidth * scale;
  const drawHeight = videoHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.save();
  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, x, y, drawWidth, drawHeight);
  } else {
    ctx.drawImage(video, x, y, drawWidth, drawHeight);
  }
  ctx.restore();
}
