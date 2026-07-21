export const config = {
  cameraFacing: "user",
  mirror: true,
  snowAmount: 0.72,
  grade: 0.28,
  sparkleSensitivity: 0.58,
  lights: 0.8,
  faceTracking: true,
  faceAccessory: "santa",
  debug: false,
};

export const presets = {
  clear: {
    snowAmount: 0.1,
    grade: 0.08,
    sparkleSensitivity: 0.25,
    lights: 0.25,
  },
  gentle: {
    snowAmount: 0.42,
    grade: 0.18,
    sparkleSensitivity: 0.42,
    lights: 0.52,
  },
  festive: {
    snowAmount: 0.72,
    grade: 0.28,
    sparkleSensitivity: 0.58,
    lights: 0.8,
  },
  snowstorm: {
    snowAmount: 1,
    grade: 0.34,
    sparkleSensitivity: 0.82,
    lights: 0.9,
  },
};

export const mediaPipeConfig = {
  moduleUrl:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm",
  wasmPath:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
  modelPath:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
};
