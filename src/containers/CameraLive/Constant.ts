import { NativeModules } from "react-native";



const LINKING_ERROR = 'Errrors'

const FrameCameraInit = NativeModules.FrameCamera ? NativeModules.FrameCamera : new Proxy(
  {},
  {
    get() {
      throw new Error(LINKING_ERROR);
    },
  }
);
export function useCustomModel(config: any): Promise<boolean> {
  return FrameCameraInit.useCustomModel(config);
}