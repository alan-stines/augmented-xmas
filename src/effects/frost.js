export class FrostAndGradeEffect {
  render(ctx, width, height, state) {
    const grade = state.config.grade;
    if (grade <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(41, 118, 154, ${0.12 * grade})`;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "screen";
    const moon = ctx.createRadialGradient(
      width * 0.5,
      height * 0.16,
      0,
      width * 0.5,
      height * 0.16,
      Math.max(width, height) * 0.58,
    );
    moon.addColorStop(0, `rgba(150, 222, 255, ${0.22 * grade})`);
    moon.addColorStop(1, "rgba(150, 222, 255, 0)");
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "source-over";
    const edge = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      Math.min(width, height) * 0.12,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.72,
    );
    edge.addColorStop(0, "rgba(0, 0, 0, 0)");
    edge.addColorStop(0.72, `rgba(221, 249, 255, ${0.04 * grade})`);
    edge.addColorStop(1, `rgba(232, 252, 255, ${0.24 * grade})`);
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

