import { Platform } from "react-native";

export const isAndroid = Platform.OS === 'android'
const poseDetection = 'models/posenet_mv1_075_float_from_checkpoints.tflite'
const iosPoseDetection = 'posenet_mv1_075_float_from_checkpoints.tflite'
const bllabel = 'models/bl230224.txt'
const bl230604 = 'models/bl230604.tflite'
const hp230504 = 'models/hp230504.tflite'
const IOSModel = 'hp230504.tflite'
const IOSlabel = 'bl230224.txt'
const IOSBL = 'bl230604.tflite'
const HP = Platform.select({
  ios: IOSModel,
  android: hp230504
})
const POSE = Platform.select({
  ios: iosPoseDetection,
  android: poseDetection
})
const BL = Platform.select({
  ios: IOSBL,
  android: bl230604
})
const label = Platform.select({
  ios: IOSlabel,
  android: bllabel
})
export const Model = {
  HP230504: HP,
  POSE_NET: POSE,
  BL230604: BL,
  LABEL: label
}