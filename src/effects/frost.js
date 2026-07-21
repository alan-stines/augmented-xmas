export class FrostAndGradeEffect {
  render(ctx, width, height, deltaSeconds, state) {
    const grade = state.config.grade;
    if (grade <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(11, 42, 64, ${0.09 * grade})`;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "screen";
    const coolHighlight = ctx.createRadialGradient(
      width * 0.48,
      height * 0.12,
      0,
      width * 0.48,
      height * 0.12,
      Math.max(width, height) * 0.52,
    );
    coolHighlight.addColorStop(0, `rgba(102, 196, 255, ${0.11 * grade})`);
    coolHighlight.addColorStop(1, "rgba(102, 196, 255, 0)");
    ctx.fillStyle = coolHighlight;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "source-over";
    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      Math.min(width, height) * 0.28,
      width * 0.5,
      height * 0.48,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.72, `rgba(2, 8, 12, ${0.04 * grade})`);
    vignette.addColorStop(1, `rgba(2, 8, 12, ${0.24 * grade})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
