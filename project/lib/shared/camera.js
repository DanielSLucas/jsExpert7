export default class Camera {
  constructor() {
    this.video = document.createElement('video');
  }

  static async init() {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        `Browser API navigator.mediaDevices.getUserMedia not available`
      )
    }

    const videoConfig = {
      audio: false,
      video: {
        // deviceId: "9b633014b25ca5038b2bc1ac24537f2d938458f388c8f6ec2b7c4e5c206db9f8",
        width: globalThis.screen.availWidth,
        height: globalThis.screen.availHeight,
        frameRate: {
          ideal: 60
        },
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    
    const camera = new Camera();
    camera.video.srcObject = stream;

    // camera.video.height = 240;
    // camera.video.width = 320;
    // document.body.append(camera.video);

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = () => {
        resolve(camera.video)
      }
    });

    camera.video.play();

    return camera;
  }
}