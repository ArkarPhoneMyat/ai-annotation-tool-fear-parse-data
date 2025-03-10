

export type RootStackParamList = {
  SplashScreen: undefined,
  PoseDetection: {
    namePlayer1: string | undefined,
    namePlayer2: string | undefined,
    debug: boolean,
    poseThreshold: number,
    objThreshold: number,
    manual: boolean,
    camera: boolean
  },
  PoseScreen: undefined,
  CameraLive: undefined
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
}