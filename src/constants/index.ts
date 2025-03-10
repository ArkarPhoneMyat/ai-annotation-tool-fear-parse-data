
import { Colors } from '@/assets/styles'

export enum ScreenName {
  MAIN_TAB = 'MainTab',
  SPLASH_SCREEN = 'SplashScreen',
  POSE_DETECTION = 'PoseDetection',
  POSE_SCREEN = 'PoseScreen',
  CAMERA_LIVE = 'CameraLive'
}

export enum StorageKey {
  authAccessToken = '@auth:accessToken',
  memberId = '@auth:memberId',
  section = '@ffmpeg:section',
  pathSection = '@ffmpeg:pathSection'
};

export const uploadUrl = 'https://api.cloudinary.com/v1_1/dgputbexe/image/upload'

export enum RequestStatus {
  idle = 'idle',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
};

export const Fonts = {
  fontPoppins: {
    fontFamily: 'Poppins-Regular',
  },
  fontPoppinsBold: {
    fontFamily: 'Poppins-Bold',
  },
}

export const colorData = [
  Colors.primaryYellow,
  Colors.primaryBlue,
  Colors.primaryRed,
  Colors.primaryGreen,
  Colors.primaryPurple,
  Colors.neutralDark,
]

export const headerKeypoints = 'Time,noseX,noseY,noseScore,leftEyeX,leftEyeY,leftEyeCore,rightEyeX,rightEyeY,rightEyeScore,leftEarX,leftEarY,leftEarScore,rightEarX,rightEarY,rightEarScore,leftShoulderX,leftShoulderY,leftShoulderScore,rightShoulderX,rightShoulderY,rightShoulderScore,leftElbowX,leftElbowY,leftElbowScore,rightElbowX,rightElbowY,rightElbowScore,leftWristX,leftWristY,leftWristScore,rightWristX,rightWristY,rightWristScore,leftHipX,leftHipY,leftHipScore,rightHipX,rightHipY,rightHipScore,leftKneeX,leftKneeY,leftKneeScore,rightKneeX,rightKneeY,rightKneeScore,leftAnkleX,leftAnkleY,leftAnkleScore,rightAnkleX,rightAnkleY,rightAnkleScore\n'
export const headerObjectdetections = 'Time,X,Y,width,height,type,confidenceScore\n';
export const headerCritical = 'Time,Event\n';

export enum EventStatus {
  scored = 'scored',
  missed = 'missed',
  mScored = 'mScored',
  mMissed = 'mMissed',
  mShot = 'mShot'
}
export enum HeaderCsv {
  keyPoints = 'keyPoints',
  objectDetections = 'objectDetections',
  criticalMoments = 'criticalMoments'
}