export class GarlandLightsEffect {
  constructor(count = 42) {
    this.bulbs = Array.from({ length: count }, (_, index) => ({
      offset: index / (count - 1),
      hue: [0, 42, 130, 195][index % 4],
      phase: Math.random() * Math.PI * 2,
    }));
  }

  render(ctx, width, height, deltaSeconds, state) {
    if (state.config.lights <= 0.01) return;

    const intensity = state.config.lights;
    const top = height * 0.055;
    const sway = Math.sin(state.time * 0.4) * height * 0.012;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = Math.max(1.5, width * 0.002);
    ctx.strokeStyle = `rgba(24, 38, 34, ${0.5 * intensity})`;
    ctx.beginPath();
    this.bulbs.forEach((bulb, index) => {
      const x = bulb.offset * width;
      const y = top + Math.sin(bulb.offset * Math.PI * 3) * height * 0.018 + sway;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    for (const bulb of this.bulbs) {
      const pulse = 0.55 + Math.sin(state.time * 2.8 + bulb.phase) * 0.35;
      const x = bulb.offset * width;
      const y = top + Math.sin(bulb.offset * Math.PI * 3) * height * 0.018 + sway;
      const glow = (9 + pulse * 18) * intensity;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glow);
      gradient.addColorStop(0, `hsla(${bulb.hue}, 100%, 72%, ${0.7 * intensity})`);
      gradient.addColorStop(1, `hsla(${bulb.hue}, 100%, 58%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsla(${bulb.hue}, 100%, 78%, ${0.88 * intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, width * 0.004), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

