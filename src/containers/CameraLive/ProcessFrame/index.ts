import { FrameProcessorConfig } from "@/types/posenet";
import { Frame } from "react-native-vision-camera";


export function processFramePlugin(frame: Frame, config: FrameProcessorConfig): any[] {
  'worklet';
  if (!_WORKLET) throw new Error('examplePlugin must be called from a frame processor!');

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __process_frame_plugin(frame, config);
}

export function frameProcesserPlugin(frame: Frame, config: FrameProcessorConfig): any[] {
  'worklet';
  if (!_WORKLET) throw new Error('examplePlugin must be called from a frame processor!');

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __frame_processer_plugin(frame, config);
}

//__frame_processer_plugin