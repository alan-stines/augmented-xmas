const resolutions = {
  hd: { width: 1280, height: 720 },
  fullHd: { width: 1920, height: 1080 },
};

export async function startCamera(video, facingMode = "user", resolution = "hd") {
  const size = resolutions[resolution] || resolutions.hd;
  const constraints = {
    audio: false,
    video: {
      width: { ideal: size.width },
      height: { ideal: size.height },
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
