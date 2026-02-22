const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultText = document.getElementById('result');
canvas.width = 640;
canvas.height = 480;
function countFingers(landmarks) {
  let count = 0;
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const palmBase = landmarks[0];
  const thumbExtension = Math.abs(thumbTip.x - palmBase.x);
  const thumbFold = Math.abs(thumbIP.x - palmBase.x);
  if (thumbExtension > thumbFold) {
    count++;
  }
  const tips = [8, 12, 16, 20];
  for (let tip of tips) {
    if (landmarks[tip].y < landmarks[tip - 2].y) {
      count++;
    }
  }
  return count;
}
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 2,  
  modelComplexity: 1,
  minDetectionConfidence: 0.85,
  minTrackingConfidence: 0.85
});
hands.onResults(results => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  let totalCount = 0;

  if (results.multiHandLandmarks.length > 0) {

    for (let i = 0; i < results.multiHandLandmarks.length; i++) {

      const landmarks = results.multiHandLandmarks[i];

      drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
      drawLandmarks(ctx, landmarks);

      totalCount += countFingers(landmarks);
    }
  }
  resultText.innerText = "Detected Number: " + totalCount;
});
const video = document.createElement('video');
video.setAttribute("playsinline", true);

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user"
      },
      audio: false
    });

    video.srcObject = stream;
    video.play();

  } catch (err) {
    alert("Camera error: " + err.message);
    console.error(err);
  }
}

startCamera();

video.onloadeddata = async () => {
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });
  camera.start();
};