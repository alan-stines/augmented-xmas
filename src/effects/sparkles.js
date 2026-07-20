export class MotionSparkleEffect {
  constructor() {
    this.sparkles = [];
  }

  render(ctx, width, height, deltaSeconds, state) {
    const sensitivity = state.config.sparkleSensitivity;
    const threshold = 1 - sensitivity * 0.85;

    if (state.analysis.motionLevel > threshold) {
      const spawnCount = Math.ceil(3 + state.analysis.motionLevel * 18);
      for (let i = 0; i < spawnCount; i += 1) {
        const source =
          state.analysis.motionPoints[
            Math.floor(Math.random() * state.analysis.motionPoints.length)
          ];
        if (!source) continue;
        this.sparkles.push({
          x: source.x * width,
          y: source.y * height,
          vx: (Math.random() - 0.5) * 90,
          vy: -30 - Math.random() * 80,
          life: 0.7 + Math.random() * 0.7,
          maxLife: 1.2,
          size: 2 + Math.random() * 4,
          hue: Math.random() > 0.44 ? 47 : 190,
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    this.sparkles = this.sparkles.filter((sparkle) => {
      sparkle.life -= deltaSeconds;
      sparkle.x += sparkle.vx * deltaSeconds;
      sparkle.y += sparkle.vy * deltaSeconds;
      sparkle.vy += 64 * deltaSeconds;
      if (sparkle.life <= 0) return false;

      const alpha = Math.max(0, sparkle.life / sparkle.maxLife);
      ctx.strokeStyle = `hsla(${sparkle.hue}, 100%, 72%, ${alpha})`;
      ctx.lineWidth = Math.max(1, sparkle.size * alpha);
      ctx.beginPath();
      ctx.moveTo(sparkle.x - sparkle.size * 2, sparkle.y);
      ctx.lineTo(sparkle.x + sparkle.size * 2, sparkle.y);
      ctx.moveTo(sparkle.x, sparkle.y - sparkle.size * 2);
      ctx.lineTo(sparkle.x, sparkle.y + sparkle.size * 2);
      ctx.stroke();
      return true;
    });
    ctx.restore();
  }
}

