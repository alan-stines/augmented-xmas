export class SnowfallEffect {
  constructor(count = 420) {
    this.flakes = [];
    for (let i = 0; i < count; i += 1) {
      this.flakes.push(this.createFlake(true));
    }
  }

  createFlake(randomY = false) {
    const depth = Math.random();
    return {
      x: Math.random(),
      y: randomY ? Math.random() : -0.05,
      radius: 0.8 + depth * 3.7,
      speed: 0.035 + depth * 0.14,
      drift: (Math.random() - 0.5) * (0.02 + depth * 0.08),
      wobble: Math.random() * Math.PI * 2,
      opacity: 0.3 + depth * 0.58,
      depth,
    };
  }

  render(ctx, width, height, deltaSeconds, state) {
    const amount = state.config.snowAmount;
    if (amount <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const flake of this.flakes) {
      if (flake.depth > amount + 0.15) continue;

      flake.wobble += deltaSeconds * (1.3 + flake.depth);
      flake.y += flake.speed * deltaSeconds;
      flake.x += (flake.drift + Math.sin(flake.wobble) * 0.018) * deltaSeconds;

      if (flake.y > 1.06 || flake.x < -0.08 || flake.x > 1.08) {
        Object.assign(flake, this.createFlake(false));
      }

      const px = flake.x * width;
      const py = flake.y * height;
      const r = flake.radius * (0.8 + amount);
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, r * 2.8);
      gradient.addColorStop(0, `rgba(255,255,255,${flake.opacity})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

