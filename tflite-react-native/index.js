import { NativeModules, Image, Platform } from 'react-native';

const { TfliteReactNative,RNTFlite } = NativeModules;

const isAndroid = Platform.OS==='android'

const TfliteModel = isAndroid ? TfliteReactNative : RNTFlite
class Tflite {
  loadModel(args, callback) {
    TfliteModel.loadModel(
      args['model'],
      args['labels'] || '',
      args['numThreads'] || 1,
      (error, response) => {
        callback && callback(error, response);
      });
  }

  loadModelTwo(args, callback) {
    TfliteModel.loadModelTwo(
      args['model'],
      args['labels'] || '',
      args['numThreads'] || 1,
      (error, response) => {
        callback && callback(error, response);
      });
  }

  runModelOnImage(args, callback) {
    TfliteModel.runModelOnImage(
      args['path'],
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['numResults'] || 5,
      args['threshold'] != null ? args['threshold'] : 0.1,
      (error, response) => {
        callback && callback(error, response);
      });
  }

  detectObjectOnImage(args, callback) {
    TfliteModel.detectObjectOnImage(
      args['path'],
      args['model'] || "SSDMobileNet",
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['threshold'] != null ? args['threshold'] : 0.1,
      args['numResultsPerClass'] || 5,
      args['anchors'] || [
        0.57273,
        0.677385,
        1.87446,
        2.06253,
        3.33843,
        5.47434,
        7.88282,
        3.52778,
        9.77052,
        9.16828
      ],
      args['blockSize'] || 32,
      (error, response) => {
        callback && callback(error, response);
      });
  }
  detectObjectOnFrame(args, callback) {
   // console.log("pathssss", args['path']);
    TfliteModel.detectObjectOnFrame(
      args['frame'],
      args['model'] || "SSDMobileNet",
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['threshold'] != null ? args['threshold'] : 0.1,
      args['numResultsPerClass'] || 5,
      args['anchors'] || [
        0.57273,
        0.677385,
        1.87446,
        2.06253,
        3.33843,
        5.47434,
        7.88282,
        3.52778,
        9.77052,
        9.16828
      ],
      args['blockSize'] || 32,
      (error, response) => {
        callback && callback(error, response);
      });
  }

  runSegmentationOnImage(args, callback) {
    TfliteModel.runSegmentationOnImage(
      args['path'],
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['labelColors'] || [
        0x000000, // background
        0x800000, // aeroplane
        0x008000, // biyclce
        0x808000, // bird
        0x000080, // boat
        0x800080, // bottle
        0x008080, // bus
        0x808080, // car
        0x400000, // cat
        0xc00000, // chair
        0x408000, // cow
        0xc08000, // diningtable
        0x400080, // dog
        0xc00080, // horse
        0x408080, // motorbike
        0xc08080, // person
        0x004000, // potted plant
        0x804000, // sheep
        0x00c000, // sofa
        0x80c000, // train
        0x004080, // tv-monitor
      ],
      args['outputType'] || "png",
      (error, response) => {
        callback && callback(error, response);
      });
  }

  runPoseNetOnImage(args, callback) {
    TfliteModel.runPoseNetOnImage(
      args['path'],
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['numResults'] || 5,
      args['threshold'] != null ? args['threshold'] : 0.5,
      args['nmsRadius'] || 20,
      (error, response) => {
        callback && callback(error, response);
      });
  }
  runPoseNetNew(args, callback) {
    TfliteModel.runPoseNetNew(
      args['path'],
      args['imageMean'] != null ? args['imageMean'] : 127.5,
      args['imageStd'] != null ? args['imageStd'] : 127.5,
      args['numResults'] || 5,
      args['threshold'] != null ? args['threshold'] : 0.5,
      args['nmsRadius'] || 20,
      (error, response) => {
        callback && callback(error, response);
      });
  }

  close() {
    TfliteModel.close();
  }
}

export default Tflite;
