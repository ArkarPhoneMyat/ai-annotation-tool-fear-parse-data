
import { useEffect, useRef, useState } from "react"
import { Button, StyleSheet, TouchableOpacity, View, Platform, Image, Dimensions, useWindowDimensions } from "react-native"
import { SplashProps } from "@/types/navigation"
import Tflite from 'tflite-react-native';
import { Text } from "@/components";
const bllabel = 'models/bl230224.txt'
const bltfLite = 'models/bl230224.tflite'
const blnblabel = 'models/blnb230430.txt'
const blnb230 = 'models/blnb230430.tflite'
const bl230604 = 'models/bl230604.tflite'
const hp230504 = 'hp230504.tflite'
const mobileNet = 'ssd_mobilenet.tflite'
const mobileLabel = 'ssd_mobilenet.txt'
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import { FFmpegKit, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import DocumentPicker, { types } from 'react-native-document-picker'
import RNFS from 'react-native-fs';

import VideoManager, { TrimmerComponent } from '@salihgun/react-native-video-processor'
import { ScreenName } from "@/constants";
import { Colors } from "@/assets/styles";
import icons from "@/assets/icons";
import { createFrames } from "@/utils/FFmpegKitHelper";
import { cutFrame, extractString, getSecondTime } from "@/utils/Helper";
const poseDetection = 'posenet_mv1_075_float_from_checkpoints.tflite'

const HOOP_NET = { height: 0.07160469889640808, left: 0.43552064895629883, top: 0.17515645921230316, width: 0.0786178708076477 }
const blue = "#25d5fd";
let tflite = new Tflite();
const options: ImagePicker.ImageLibraryOptions = {
  selectionLimit: 0,
  mediaType: 'photo',
  includeBase64: false,
  includeExtra: true,
}
const imageSize = 320
const SplashScreen = ({ navigation }: SplashProps) => {
  const { width, height } = useWindowDimensions()
  const [recognitionWithDuration, setRecognitionWithDuration] = useState<any>([])
  const [imageWidth, setImageWidth] = useState(height / 1.5)
  const [imageHeight, setImageHeight] = useState(width)
  const [widthFrame, setWidthFrame] = useState(imageSize)
  const [heightFrame, setHeightFrame] = useState(imageSize)
  const [source, setSource] = useState({ uri: '', duration: 0 })
  const [fullScreen, setFullScreen] = useState(true)
  const [pathUri, setPathUri] = useState('')
  const [currentPosition, setCurrentPosition] = useState(0)
  const [isImage, setIsImage] = useState(false)
  const [shotPositions, setShotPositions] = useState<any[]>([])
  let videoPlayerRef = useRef()

  useEffect(() => {
    //Orientation.lockToLandscape()
    onSelectModel()
  }, [])
  const onSelectModel = () => {
    tflite.loadModelTwo({
      model: poseDetection,
      labels: ''
    },
      (err: any, res: any) => {
        if (err)
          console.log(err);
        else
          console.log(res, 'the first');
      });
    tflite.loadModel({
      model: hp230504,
      labels: '',
    },
      (err: any, res: any) => {
        if (err)
          console.log(err);
        else
          console.log(res, 'okela');
      });
  }

  useEffect(() => {
    const filterRecognitions = recognitionWithDuration.length > 0 && recognitionWithDuration.filter((item: any) => item?.duration === currentPosition)
    console.log("widthFrame", HOOP_NET.left * widthFrame, widthFrame);

    const res = filterRecognitions && filterRecognitions[0]?.recognitions.some((item: any) => {
      if (HOOP_NET.left * widthFrame - item["rect"]["x"] * widthFrame > 0) {
        return true

      }
      return false
    })

    if (filterRecognitions) {
      const objShot = {
        position: res ? 'left' : 'right',
        scored: false
      }
      const shots = [...shotPositions, objShot]
      setShotPositions(shots)
    }

  }, [recognitionWithDuration])
  //TODO select path direc downloa 
  const onSelectImageToDownLoad = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [types.video], copyTo: 'cachesDirectory'
      });

      const res = response[0];
      console.log("logggggggggg", res);
      const indexRandom = Math.random().toString(36).substring(7);

      // console.log("valuesssssssss", readFileURL(res.uri));

      Image.getSize(res?.fileCopyUri, (w, h) => {
        setWidthFrame(width)
        setHeightFrame(h * width / w - 100)
      });
      const destPath = `${RNFS.TemporaryDirectoryPath}/${indexRandom}`
      await RNFS.copyFile(res.uri, destPath);
      const realPath = await (await RNFS.stat(destPath)).path + '/' + res.name
      const realPathAndroid = `file://${realPath}`

      let newRecognition: any = [...recognitionWithDuration]
      await tflite.detectObjectOnImage({
        path: realPathAndroid,
        imageMean: 0.0,
        imageStd: 255.0,
        threshold: 0.4,
        model: 'YOLO'
        //numResultsPerClass: 1,
      },
        (err: any, res: any) => {
          if (err)
            console.log(err);
          else {
            //setRecognitions(res)
            const objRect = {
              recognitions: res,
              duration: 0
            }
            newRecognition.push(objRect)
            setRecognitionWithDuration([objRect])
          }
        });


      setPathUri(res?.fileCopyUri)
      if (res) {
        const split = res.uri.split('/');
        const name = split.pop();
        const inbox = split.pop();
        if (Platform.OS === 'android') {
          return {
            res,
            id: indexRandom,
            realPath: res?.uri,
          };
        }
        console.log("logggggggggg", res);

        // const realPath = Platform.OS === 'ios'
        //   ? `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`
        //   : res.uri;

        // const decodeUrl = decodeURIComponent(realPath);
        // return {
        //   res,
        //   id: indexRandom,
        //   realPath: decodeUrl,
        // };
      }
    } catch (err) {
      console.log("eorrr", err);

      // if (DocumentPicker.isCancel(err)) {
      //   Alert.alert('Upload cancelled');
      // } else {
      //   Alert.alert(`Unknown Error: ${JSON.stringify(err)}`);
      //   throw err;
      // }
    }
  }
  const extractword = (str: any, start: string, end: string) => {
    var startindex = str.indexOf(start);
    var endindex = str.indexOf(end, startindex);
    if (startindex != -1 && endindex != -1 && endindex > startindex)
      return str.substring(startindex, endindex)
  }
  const formatPath = (path: string) => {
    const secondDotIndex = path.lastIndexOf('.');
    const newPath = Platform.select({
      ios: path.split('.')[0],
      android: path.substring(0, secondDotIndex),
    }) as string;
    return newPath;
  }
  // const createFrames = async (path: string, fps: number = 1) => {
  //   const newPath = formatPath(path);
  //   const command = `-i ${path} -vf fps=${fps} -qscale:v 2 ${newPath}_thumb_%01d.jpg`;
  //   await FFmpegKit.execute(command)
  //   return `${newPath}_thumb_`;
  // }
  const onSelectImage = async () => {
    const options: any = {
      saveToPhotos: true,
      mediaType: 'video',
      includeBase64: false,
      includeExtra: true,
    };
    setRecognitionWithDuration([])
    const response: ImagePicker.ImagePickerResponse = await ImagePicker.launchImageLibrary(options)
    if (response) {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode)
      } else {
        const assets = response?.assets && response?.assets[0]

        const w = assets?.width ?? 200;
        const h = assets?.height ?? 200;

        setWidthFrame(width)
        setHeightFrame(h * width / w)
        // const framesPath = await VideoManager.createFrames(assets?.uri ?? '', 16);
        // console.log("patthss", framesPath);


        // const framesPath = await createFrames(assets?.uri ?? '', 16);
        // await createFrames(assets?.uri ?? '', 16)
        let newRecognition: any = [...recognitionWithDuration]
        const { path, messages = [] } = await createFrames(assets?.uri, 16)
        messages.map(async (mess: any) => {
          const [time, frame] = await Promise.all([extractString(mess, 'time=', " "), extractString(mess, 'frame', " fps")])
          const getTimeWithDuration = cutFrame(time)
          const numberFrame = cutFrame(frame)
          const seconds = getSecondTime(getTimeWithDuration);
          const uriPath = `${path}${numberFrame}.jpg`
          await tflite.detectObjectOnImage({
            path: uriPath,
            threshold: 0.01,
          },
            (err: any, res: any) => {
              //console.log("urirrrr", uriPath);
              if (err)
                console.log(err);
              else {
                const objRect = {
                  recognitions: res,
                  duration: seconds.toFixed(1),
                }
                newRecognition.push(objRect)
                console.log("objectss", res);

                // console.log("recognitionWithDuration2", newRecognition);
              }
            });
        })
        setRecognitionWithDuration(newRecognition)
        setPathUri(assets?.uri)
      }
    }

  }


  const onLoadVideo = data => {

    let w = data.naturalSize.width;
    let h = data.naturalSize.height;
    const screenWidth = width - 20;
    const screenHeight = height / 1.5;
    if (w > screenWidth) {
      h = (h * screenWidth) / w;
      w = screenWidth;
    }

    if (h > screenHeight) {
      w = (w * screenHeight) / h;
      h = screenHeight;
    }

    setImageWidth(w)
    setImageHeight(h)
  };



  const renderPose = () => {
    const filterRecognitions = recognitionWithDuration.length > 0 && recognitionWithDuration.filter((item: any) => item?.duration === currentPosition)

    //get score > 0.3 
    //TODO result to native code 
    return filterRecognitions.length > 0 && filterRecognitions[0]?.recognitionPose?.map((res: any, idx: number) => {
      return Object.values(res["keypoints"]).map((kp: any, id) => {
        const left = kp["x"] * widthFrame - 6;
        const top = kp["y"] * heightFrame - 6;
        const width = widthFrame;
        const height = heightFrame;
        //kp["part "]
        console.log("indexxxx", idx);

        console.log("kpppppppp", kp);


        return (
          <View key={id} style={{ position: 'absolute', top, left, width, height }}>
            <Text style={{ color: idx === 0 ? Colors.primaryBlue : Colors.primaryRed, fontSize: 12 }}>
              {"● "}
            </Text>
          </View>
        )
      });
    });
  }


  const renderResult = () => {
    const filterRecognitions = recognitionWithDuration.length > 0 && recognitionWithDuration.filter((item: any) => item?.duration === currentPosition)

    //get score > 0.3 

    return filterRecognitions && filterRecognitions[0]?.recognitions.map((res: any, id: any) => {
      const left = res["rect"]["x"] * widthFrame;
      const top = res["rect"]["y"] * heightFrame;
      const width = res["rect"]["w"] * widthFrame;
      const height = res["rect"]["h"] * heightFrame;
      const object = {
        left: res["rect"]["x"],
        top: res["rect"]["y"],
        width: res["rect"]["w"],
        height: res["rect"]["h"]
      }
      console.log("filterRecognitions", object);
      if (res["confidenceInClass"] > 0.1) {
        return (
          <View key={id} style={[{ top, left, width, height, position: 'absolute', backgroundColor: 'green' }]}>
            <Text style={{ color: 'white' }}>
              {res["detectedClass"] + " " + (res["confidenceInClass"] * 100).toFixed(0) + "%"}
            </Text>
          </View>
        )
      }

      return <View key={id} />
      // config user 

    });
  }
  const updateTime = ({ currentTime }: any) => {

    setCurrentPosition(currentTime.toFixed(1))
  }


  const navigatePostNet = () => {
    navigation.navigate(ScreenName.POSE_SCREEN)
  }
  const withImage = async () => {
    setIsImage(true)
    setRecognitionWithDuration([])
    // setWidthFrame(imageSize)
    // setHeightFrame(imageSize)
    const options: any = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false,
      includeExtra: true,
    };
    const response: ImagePicker.ImagePickerResponse = await ImagePicker.launchImageLibrary(options)
    if (response) {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode)
      } else {
        const assets = response?.assets && response?.assets[0]
        // const framesPath = "file:///data/user/0/com.annotation/cache/rn_image_picker_lib_temp_f71afc09-e5f0-4033-acf8-f1c502ca073d_thumb_"

        const w = assets?.width ?? 200;
        const h = assets?.height ?? 200;
        setWidthFrame(width)
        setHeightFrame(h * width / w)
        //  const uriPath = `${framesPath}${492}.jpg`
        const objRect = {
          recognitions: [],
          duration: 0,
          recognitionPose: [],
        }
        await new Promise((resolve, reject) => {
          tflite.runPoseNetNew({
            path: assets?.uri,
            threshold: 0.9,
          },
            (err: any, res: any) => {
              if (err)
                console.log(err);
              else {
                //setRecognitions(res)
                objRect.recognitionPose = res
                resolve(res)

                // setRecognitionWithDuration([objRect])

                //setRecognitionWithDuration([objRect])
              }
            });
        })
        await new Promise((resolve, reject) => {
          tflite.detectObjectOnImage({
            path: assets?.uri,
            threshold: 0.8
          },
            (err: any, res: any) => {
              if (err) {
                console.log(err, 'run');
              }
              else {
                // return resolve({
                //   recognitions: res,
                //   duration: seconds.toFixed(1),
                // })
                objRect.recognitions = res
                resolve(res)
              }
            });
        })


        setRecognitionWithDuration([objRect])
        setPathUri(assets?.uri)

      }
    }
  }

  console.log("shotPositions", shotPositions.length);



  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Button title="postnet" onPress={navigatePostNet} />
        <Button title="postne11" onPress={withImage} />
      </View>
      <TouchableOpacity style={
        [styles.imageContainer, {
          borderWidth: pathUri ? 0 : 2
        }]} onPress={onSelectImage}>
        {
          pathUri && !isImage ?
            <Video source={{ uri: pathUri }}
              ref={(ref: any) => {
                videoPlayerRef = ref
              }}
              fullScreen={fullScreen}
              onLoad={onLoadVideo}
              onProgress={updateTime}
              resizeMode={"cover"}
              style={{ height: heightFrame, width: widthFrame }} /> : pathUri && isImage ? <Image source={{ uri: pathUri }} style={{
                height: heightFrame, width: widthFrame
              }} resizeMode="contain" />
              :
              <Text style={styles.text}>Select Picture</Text>
        }
        <View style={{ position: 'absolute', top: HOOP_NET.top * heightFrame, left: HOOP_NET.left * widthFrame + 10, width: HOOP_NET.width * widthFrame, borderWidth: 1, borderColor: 'blue', height: HOOP_NET.height * heightFrame + 10 }} />
        <View style={{ position: 'absolute', right: 10, top: 10, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: Colors.white, paddingHorizontal: 4 }}>
            <Text>2-0</Text>
          </View>
          <View >
            <Image source={icons.halfCourt} style={{ width: 120, height: 80 }} resizeMode="contain" />
            {shotPositions.length > 0 && shotPositions.map((item, index) => {
              console.log("itemsss", item);
              if (item?.position === 'left') {
                return <View key={index} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'green', position: 'absolute', left: 20 }} />
              }
              return <Text style={{ color: 'red', fontSize: 6, position: 'absolute', left: 80 }}>X</Text>
            })}
          </View>
        </View>
        <View style={styles.boxes}>
          {recognitionWithDuration.length > 0 && renderResult()}
          {recognitionWithDuration.length > 0 && renderPose()}
        </View>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  fullscreenVideo: {
    backgroundColor: 'black',
    elevation: 1,
    flex: 1,

  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  imageContainer: {
    borderColor: 'blue',
    borderRadius: 5,
    flex: 1,
  },
  text: {
    color: 'blue'
  },
  button: {
    width: 200,
    backgroundColor: 'blue',
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 15
  },
  box: {
    position: 'absolute',
    borderColor: 'blue',
    borderWidth: 2,
    padding: 10,
  },
  boxes: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  }
});
export default SplashScreen