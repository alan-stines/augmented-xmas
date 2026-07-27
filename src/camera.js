export async function startCamera(video, facingMode = "user") {
  const constraints = {
    audio: false,
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30, max: 30 },
      facingMode: { ideal: facingMode },
    },
  };

  stopCamera(video);
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function stopCamera(video) {
  const stream = video.srcObject;
  if (!stream) return;

  for (const track of stream.getTracks()) {
    track.stop();
  }
  video.srcObject = null;
}
