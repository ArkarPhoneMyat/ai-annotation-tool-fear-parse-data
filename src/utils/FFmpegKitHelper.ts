import { FFmpegKit, FFmpegKitConfig } from "ffmpeg-kit-react-native";
import { Platform } from "react-native";
import { ProcessFrames } from "@/types/posenet";

const formatPath = (path: string) => {
  const secondDotIndex = path.lastIndexOf('.');
  const newPath = Platform.select({
    ios: path.split('.')[0],
    android: path.substring(0, secondDotIndex),
  }) as string;
  return newPath;
}

interface Callback {
  (res: ProcessFrames): void;
}

export const createFrames = async (path: string, fps: number = 1, callback: Callback) => {
  const newPath = formatPath(path);
  const command = `-i ${path} -vf fps=${fps} ${newPath}_thumb_%01d.jpg`;
  FFmpegKit.executeAsync(command, session => {
    console.log();
  }, log => {
    //log
  }, statistics => {
    callback({
      path: `${newPath}_thumb_`,
      duration: statistics.getTime(),
      frameNumber: statistics.getVideoFrameNumber(),
      isProcess: false,
    })
  });
  // handle section completed
  FFmpegKitConfig.enableFFmpegSessionCompleteCallback(session => {
    const sessionId = session.getSessionId();
    if (sessionId) {
      callback({
        path: '',
        duration: 0,
        frameNumber: 0,
        isProcess: true,
      })
    }
  });
}
// const stopRecording: StopRecording = () => {
  //   return new Promise(async (resolve, reject) => {
  //     const res = await RecordScreen.stopRecording().catch(reject);
  //     setIsVisible(true)
  //     if (res) {
  //       const newPath = createNewFilePath(res.result.outputURL);
  //       const { width, height, x, y } = calcCropLayout(layout);
  //       FFmpegKit.executeWithArguments([
  //         '-i',
  //         res.result.outputURL,
  //         '-vf',
  //         `crop=w=${width}:h=${height}:x=${x}:y=${y}`,
  //         '-c:v',
  //         'libx264',
  //         newPath,
  //       ]).then(() => {
  //         //res.result.outputURL = newPath;
  //         resolve(res);
  //       });
  //     }
  //   });
  // };