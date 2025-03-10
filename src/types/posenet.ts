


export interface Recognition {
  duration: any,
  poseNetRecognitions: any[],
  ballRecognitions: any[],
}


interface Rect {
  h: number,
  w: number,
  x: number,
  y: number
}


export interface FrameProcessorConfig {
  model: string,
  scoreThreshold: number,
  maxResults: number,
  numThreads: number,
}



export interface PoseRect {
  confidenceInClass: number,
  detectedClass: string,
  rect: Rect
}
export interface Marked {
  // coordinates marked on scoreboard
  position: Rect,
  // has scored or miss
  scored: boolean,
  // check current player
  isServePlayer1: boolean,
  // current time
  duration: number
}
export interface ProcessFrames {
  path: string,
  duration: number,
  frameNumber: number,
  //process frame completed
  isProcess: boolean,
}