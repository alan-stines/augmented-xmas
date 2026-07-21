export class MediaPipeFaceVisionProvider {
  constructor(options) {
    this.options = options;
    this.faceLandmarker = null;
    this.status = "idle";
    this.error = "";
    this.lastVideoTime = -1;
    this.lastRun = 0;
    this.faces = [];
  }

  async load() {
    if (this.faceLandmarker || this.status === "loading") return;

    this.status = "loading";
    try {
      const { FaceLandmarker, FilesetResolver } = await import(this.options.moduleUrl);
      const vision = await FilesetResolver.forVisionTasks(this.options.wasmPath);
      this.faceLandmarker = await createFaceLandmarker(
        FaceLandmarker,
        vision,
        this.options.modelPath,
        "GPU",
      );
      this.status = "ready";
    } catch (error) {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(this.options.moduleUrl);
        const vision = await FilesetResolver.forVisionTasks(this.options.wasmPath);
        this.faceLandmarker = await createFaceLandmarker(
          FaceLandmarker,
          vision,
          this.options.modelPath,
          "CPU",
        );
        this.status = "ready";
      } catch (fallbackError) {
        this.status = "error";
        this.error =
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error("MediaPipe face tracking failed to load", fallbackError);
      }
    }
  }

  async analyze(video, now, enabled) {
    if (!enabled) {
      this.faces = [];
      return this.snapshot();
    }

    if (this.status === "idle") {
      this.load();
    }

    if (
      this.status !== "ready" ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.currentTime === this.lastVideoTime ||
      now - this.lastRun < 85
    ) {
      return this.snapshot();
    }

    this.lastVideoTime = video.currentTime;
    this.lastRun = now;

    try {
      const result = this.faceLandmarker.detectForVideo(video, now);
      this.faces = (result.faceLandmarks || []).map((landmarks) => ({
        landmarks,
        box: getLandmarkBox(landmarks),
      }));
    } catch (error) {
      this.status = "error";
      this.error = error instanceof Error ? error.message : String(error);
      console.error("MediaPipe face tracking failed", error);
    }

    return this.snapshot();
  }

  snapshot() {
    return {
      status: this.status,
      error: this.error,
      faces: this.faces,
    };
  }
}

function createFaceLandmarker(FaceLandmarker, vision, modelPath, delegate) {
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelPath,
      delegate,
    },
    runningMode: "VIDEO",
    numFaces: 2,
    minFaceDetectionConfidence: 0.45,
    minFacePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
  });
}

function getLandmarkBox(landmarks) {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;

  for (const point of landmarks) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
    centerX: minX + (maxX - minX) / 2,
    centerY: minY + (maxY - minY) / 2,
  };
}
