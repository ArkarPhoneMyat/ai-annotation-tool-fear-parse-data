import { ScreenName } from "@/constants";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./stack";



export type SplashProps = NativeStackScreenProps<RootStackParamList, ScreenName.SPLASH_SCREEN>;
export type PoseDetectionProps = NativeStackScreenProps<RootStackParamList, ScreenName.POSE_DETECTION>;
export type PoseScreenProps = NativeStackScreenProps<RootStackParamList, ScreenName.POSE_SCREEN>;
export type CameraLiveProps = NativeStackScreenProps<RootStackParamList, ScreenName.CAMERA_LIVE>;

