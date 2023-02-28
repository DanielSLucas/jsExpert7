import { knownGestures, gestureStrings } from "../util/gestures.js";

export default class HandGestureService {
  #gestureEstimator;
  #handPoseDetection;
  #handsVersion;
  #detector = null;

  constructor({ fingerpose, handPoseDetection, handsVersion }) {
    this.#gestureEstimator = new fingerpose.GestureEstimator(knownGestures);
    this.#handPoseDetection = handPoseDetection;
    this.#handsVersion = handsVersion;
  }

  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandMarksFromKeypoints(keypoints3D),
      // porcentagem de confiança do gesto (90%)
      9
    );
    return predictions.gestures;
  }

  async * detectGestures(predictions) {
    for (const hand of predictions) {
      if(!hand.keypoints3D) continue;

      const gestures = await this.estimate(hand.keypoints3D);
      if (!gestures.length) continue;

      const result = gestures.reduce(
        (previus, current) => (previus.score > current.score) ? previus : current
      );

      const {x, y} = hand.keypoints.find(keypoint => keypoint.name === 'index_finger_tip');
      
      yield { event: result.name, x, y }
      
      console.log(
        'Gesture',
        gestureStrings[result.name],
        // `position [${x}, ${y}]`
      );
    }
  }

  #getLandMarksFromKeypoints(keypoints3D) {
    return keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z]);
  }

  async estimateHands(video) {
    return this.#detector.estimateHands(video, {
      flipHorizontal: true,
    });
  }

  async initializeDetector() {
    if(this.#detector) return this.#detector;

    const model = this.#handPoseDetection.SupportedModels.MediaPipeHands;
    
    const detectorConfig = {
      runtime: 'mediapipe',
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
      // 'full' é o mais pesado e mais preciso
      modelType: 'lite',
      maxHands: 2,
    };

    this.#detector = await this.#handPoseDetection.createDetector(model, detectorConfig);

    return this.#detector;
  }
}