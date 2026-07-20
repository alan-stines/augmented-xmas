export class FrameAnalyzer {
  constructor(width = 160, height = 90) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.previous = null;
    this.motionPoints = [];
    this.motionLevel = 0;
    this.brightness = 0;
  }

  analyze(video) {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return this.snapshot();
    }

    this.ctx.drawImage(video, 0, 0, this.width, this.height);
    const image = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = image.data;
    const motionPoints = [];
    let changed = 0;
    let luminance = 0;
    const stride = 4;

    for (let y = 0; y < this.height; y += 3) {
      for (let x = 0; x < this.width; x += 3) {
        const i = (y * this.width + x) * 4;
        const luma = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
        luminance += luma;

        if (this.previous) {
          const diff =
            Math.abs(data[i] - this.previous[i]) +
            Math.abs(data[i + 1] - this.previous[i + 1]) +
            Math.abs(data[i + 2] - this.previous[i + 2]);

          if (diff > 82) {
            changed += 1;
            if (motionPoints.length < 90 && Math.random() < 0.15) {
              motionPoints.push({
                x: x / this.width,
                y: y / this.height,
                strength: Math.min(1, diff / 255),
              });
            }
          }
        }
      }
    }

    const samples = Math.ceil(this.width / 3) * Math.ceil(this.height / 3);
    this.motionPoints = motionPoints;
    this.motionLevel = this.previous ? Math.min(1, changed / (samples * 0.28)) : 0;
    this.brightness = luminance / samples / 255;
    this.previous = new Uint8ClampedArray(data);
    return this.snapshot();
  }

  snapshot() {
    return {
      brightness: this.brightness,
      motionLevel: this.motionLevel,
      motionPoints: this.motionPoints,
    };
  }
}

