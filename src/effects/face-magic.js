export class FaceMagicEffect {
  render(ctx, width, height, deltaSeconds, state) {
    if (!state.config.faceTracking || !state.frame || !state.vision?.faces.length) {
      return;
    }

    ctx.save();

    for (const face of state.vision.faces) {
      const box = mapBox(face.box, state.frame);
      const center = mapPoint(face.box.centerX, face.box.centerY, state.frame);
      const faceSize = Math.max(box.width, box.height);
      const anchorY = box.y + faceSize * 0.05;
      const pulse = 0.72 + Math.sin(state.time * 4.2) * 0.18;

      ctx.globalCompositeOperation = "lighter";
      drawHalo(ctx, center.x, anchorY + faceSize * 0.12, faceSize, pulse);
      ctx.globalCompositeOperation = "source-over";
      drawAccessory(
        ctx,
        state.config.faceAccessory,
        center.x,
        anchorY,
        box.width,
        faceSize,
        state.time,
        face,
        state.frame,
      );
      drawFaceBox(ctx, box);
    }

    ctx.restore();
  }
}

function drawAccessory(ctx, accessory, x, y, width, size, time, face, frame) {
  if (accessory === "none") return;
  if (accessory === "elf") {
    drawElfHat(ctx, x, y, width, size, time);
    return;
  }
  if (accessory === "crown") {
    drawSparkleCrown(ctx, x, y, size, time);
    return;
  }
  if (accessory === "reindeer") {
    drawReindeerAntlers(ctx, x, y, width, size, time, face, frame);
    return;
  }
  drawSantaHat(ctx, x, y, width, size, time);
}

function mapPoint(x, y, frame) {
  const rawX = frame.x + x * frame.width;
  const canvasX = frame.mirror ? frame.canvasWidth - rawX : rawX;
  return {
    x: canvasX,
    y: frame.y + y * frame.height,
  };
}

function mapBox(box, frame) {
  const left = mapPoint(box.x, box.y, frame);
  const right = mapPoint(box.x + box.width, box.y + box.height, frame);
  return {
    x: Math.min(left.x, right.x),
    y: Math.min(left.y, right.y),
    width: Math.abs(right.x - left.x),
    height: Math.abs(right.y - left.y),
  };
}

function drawHalo(ctx, x, y, size, pulse) {
  const radius = Math.max(34, size * 0.68);
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 218, 93, ${0.24 * pulse})`);
  gradient.addColorStop(0.5, `rgba(85, 214, 255, ${0.18 * pulse})`);
  gradient.addColorStop(1, "rgba(85, 214, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSparkleCrown(ctx, x, y, size, time) {
  const width = Math.max(72, size * 0.95);
  const baseY = y + size * 0.02;
  const points = 5;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "rgba(255, 220, 102, 0.8)";
  ctx.shadowBlur = Math.max(10, size * 0.08);
  ctx.strokeStyle = "rgba(255, 223, 79, 0.98)";
  ctx.lineWidth = Math.max(4, size * 0.034);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();

  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const px = x - width / 2 + t * width;
    const py = baseY + Math.sin(time * 2.6 + i) * size * 0.025;
    const peakY = py - size * (i % 2 === 0 ? 0.3 : 0.18);
    if (i === 0) ctx.moveTo(px, py);
    ctx.lineTo(px + width / (points * 2), peakY);
    ctx.lineTo(px + width / points, py);
  }

  ctx.stroke();

  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const px = x - width / 2 + t * width;
    const py = baseY - size * (i % 2 === 0 ? 0.3 : 0.18);
    drawStar(ctx, px, py, Math.max(5, size * 0.055));
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 244, 188, 0.9)";
  roundedRect(ctx, x - width * 0.48, baseY - size * 0.02, width * 0.96, Math.max(7, size * 0.055), Math.max(4, size * 0.025));
  ctx.fill();
  ctx.restore();
}

function drawReindeerAntlers(ctx, x, y, faceWidth, size, time, face, frame) {
  const spread = Math.max(56, faceWidth * 0.58);
  const baseY = y - size * 0.16;
  const sway = Math.sin(time * 2.1) * size * 0.012;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = Math.max(7, size * 0.06);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(150, 92, 47, 0.98)";
  ctx.lineWidth = Math.max(6, size * 0.045);

  drawAntler(ctx, x - spread * 0.42, baseY + sway, -1, size);
  drawAntler(ctx, x + spread * 0.42, baseY - sway, 1, size);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(82, 48, 30, 0.98)";
  ctx.beginPath();
  ctx.ellipse(x - spread * 0.42, baseY + size * 0.02, size * 0.08, size * 0.045, 0, 0, Math.PI * 2);
  ctx.ellipse(x + spread * 0.42, baseY + size * 0.02, size * 0.08, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  const nose = getNosePoint(face, frame) || { x, y: y + size * 0.42 };
  const nosePulse = 0.72 + Math.sin(time * 5.2) * 0.2;
  const noseRadius = Math.max(12, size * 0.09);
  const noseGlow = ctx.createRadialGradient(nose.x, nose.y, 0, nose.x, nose.y, noseRadius * 4);
  noseGlow.addColorStop(0, `rgba(255, 32, 42, ${0.75 * nosePulse})`);
  noseGlow.addColorStop(1, "rgba(255, 32, 42, 0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = noseGlow;
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, noseRadius * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(235, 18, 32, 0.98)";
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, noseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getNosePoint(face, frame) {
  const landmarks = face?.landmarks;
  if (!landmarks?.length || !frame) return null;
  const noseTip = landmarks[1] || landmarks[4];
  if (!noseTip) return null;
  return mapPoint(noseTip.x, noseTip.y, frame);
}

function drawAntler(ctx, x, y, direction, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x + direction * size * 0.02,
    y - size * 0.18,
    x + direction * size * 0.18,
    y - size * 0.36,
    x + direction * size * 0.28,
    y - size * 0.52,
  );
  ctx.stroke();

  drawAntlerBranch(ctx, x + direction * size * 0.12, y - size * 0.25, direction, -0.14, -0.2, size);
  drawAntlerBranch(ctx, x + direction * size * 0.2, y - size * 0.38, direction, 0.02, -0.22, size);
  drawAntlerBranch(ctx, x + direction * size * 0.26, y - size * 0.48, direction, 0.16, -0.16, size);
}

function drawAntlerBranch(ctx, x, y, direction, dx, dy, size) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + direction * size * (dx * 0.5),
    y + size * dy * 0.5,
    x + direction * size * dx,
    y + size * dy,
  );
  ctx.stroke();
}

function drawSantaHat(ctx, x, y, faceWidth, size, time) {
  const brimWidth = Math.max(76, faceWidth * 1.28);
  const brimHeight = Math.max(18, size * 0.16);
  const brimY = y;
  const tipX = x + brimWidth * 0.32;
  const tipY = y - size * 0.72 + Math.sin(time * 2.8) * size * 0.025;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = Math.max(8, size * 0.08);
  ctx.shadowOffsetY = Math.max(3, size * 0.025);

  ctx.fillStyle = "rgba(188, 14, 30, 0.98)";
  ctx.beginPath();
  ctx.moveTo(x - brimWidth * 0.48, brimY);
  ctx.quadraticCurveTo(x - brimWidth * 0.18, y - size * 0.62, tipX, tipY);
  ctx.quadraticCurveTo(x + brimWidth * 0.04, y - size * 0.22, x + brimWidth * 0.48, brimY);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(250, 252, 248, 0.96)";
  roundedRect(ctx, x - brimWidth / 2, brimY - brimHeight / 2, brimWidth, brimHeight, brimHeight / 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.46)";
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.stroke();

  drawPom(ctx, tipX, tipY, Math.max(9, size * 0.1));
  ctx.restore();
}

function drawElfHat(ctx, x, y, faceWidth, size, time) {
  const brimWidth = Math.max(72, faceWidth * 1.2);
  const brimHeight = Math.max(16, size * 0.14);
  const brimY = y;
  const tipX = x - brimWidth * 0.3;
  const tipY = y - size * 0.66 + Math.sin(time * 2.4) * size * 0.022;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = Math.max(8, size * 0.08);
  ctx.shadowOffsetY = Math.max(3, size * 0.025);

  ctx.fillStyle = "rgba(28, 150, 67, 0.98)";
  ctx.beginPath();
  ctx.moveTo(x - brimWidth * 0.48, brimY);
  ctx.quadraticCurveTo(x + brimWidth * 0.02, y - size * 0.7, tipX, tipY);
  ctx.quadraticCurveTo(x + brimWidth * 0.2, y - size * 0.22, x + brimWidth * 0.48, brimY);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(218, 36, 44, 0.96)";
  roundedRect(ctx, x - brimWidth / 2, brimY - brimHeight / 2, brimWidth, brimHeight, brimHeight / 2);
  ctx.fill();

  const bellPulse = 0.75 + Math.sin(time * 5) * 0.2;
  ctx.fillStyle = `rgba(255, 211, 80, ${bellPulse})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY, Math.max(7, size * 0.075), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPom(ctx, x, y, radius) {
  const gradient = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.3, 0, x, y, radius);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(1, "rgba(218, 235, 236, 0.92)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function drawFaceBox(ctx, box) {
  ctx.strokeStyle = "rgba(120, 231, 255, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function drawStar(ctx, x, y, size) {
  ctx.strokeStyle = "rgba(255, 244, 188, 0.95)";
  ctx.lineWidth = Math.max(1, size * 0.35);
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}
