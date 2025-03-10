
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import {
  View, useWindowDimensions, Image, Dimensions,
  ImageBackground, StatusBar, Modal, BackHandler, TouchableOpacity
} from "react-native"
import { PoseDetectionProps } from "@/types/navigation"
import Tflite from 'tflite-react-native';
import { Text } from "@/components";
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import styles from './styles';
import { Colors } from "@/assets/styles";
import LoadingOverlay from "@/components/LoadingOverlay";
import { EventStatus, HeaderCsv, headerCritical, headerKeypoints, headerObjectdetections } from "@/constants";
import OverWriteButton from "@/components/OverWriteButton";
import icons from "@/assets/icons";
import PlayerCard from "@/components/PlayerCard";
import { formatKeyPoints } from "@/utils/Helper";
import RecordScreen, { RecordingResult } from 'react-native-record-screen';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { VideoPickerResponse } from "@/utils/UpdateImage";
import { Marked, PoseRect, ProcessFrames, Recognition } from "@/types/posenet";
import { createFrames } from "@/utils/FFmpegKitHelper";
import ScoreBardCard from "./ScoreBoardCard";
import ButtonCard from "./ButtonCard";
import { Model, isAndroid } from "@/utils/Device";
import { handleSaveVideo, saveLocalFile } from "@/utils/RNFetchBlodHelper";
import { Linking } from "react-native";

let tflite = new Tflite();
let topEyePlayer1 = 0;
let topEyePlayer2 = 0;
let deviceHeight = Dimensions.get('screen').width;
let windowHeight = Dimensions.get('window').width;
interface Callback {
  (res: any): void;
}
const PoseDetection = ({ route, navigation }: PoseDetectionProps) => {
  const { namePlayer1 = '', namePlayer2 = '', debug, objThreshold, poseThreshold, manual, camera } = route.params
  const [recognitionWithDuration, setRecognitionWithDuration] = useState<any>([])
  const { height, width, scale } = useWindowDimensions()
  const [widthFrame, setWidthFrame] = useState(height / 1.5)
  const [heightFrame, setHeightFrame] = useState(width)
  const [pathUri, setPathUri] = useState<string>()
  const [currentDuration, setCurrentDuration] = useState(0)
  const [hoopNet, setHoopNet] = useState({
    height: 0, left: 0, top: 0, width: 0, confidenceInClass: 0,
  })
  const [loading, setLoading] = useState(false)
  const [player1, setPlayer1] = useState({
    scored: 0,
    attempts: 0,
  })
  const [player2, setPlayer2] = useState({
    scored: 0,
    attempts: 0,
  })
  let videoPlayerRef = useRef(null)
  const [serveBall, setServeBall] = useState(true)
  const [shotPositions, setShotPositions] = useState<any[]>([])
  const [objectDetect, setObjectDetect] = useState<any[]>([])
  const [keypoints, setKeyPoints] = useState<any[]>([])
  const [criticalMoments, setCriticalMoments] = useState<any[]>([])
  const [canSave, setCanSave] = useState(true)
  const [isReplyVideo, setIsReplyVideo] = useState(true)
  const [tempMarked, setTempMarked] = useState<any[]>([])
  const [time, setTime] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  let navHeightBottom = deviceHeight - windowHeight - 20 > 0 ? deviceHeight - windowHeight - 20 : 50
  const [processDetected, setProcessDetected] = useState<ProcessFrames>()
  // const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();
  //onst [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('not-determined');


  useEffect(() => {
    if (time > 0) {
      let findMarkedShot = shotPositions.find((marked: any) => marked?.duration === time)
      setTempMarked([...tempMarked, findMarkedShot])
      if (findMarkedShot?.scored) {
        if (findMarkedShot?.isServePlayer1) {
          setScoreToPlayer1(player1.scored + 1, player1.attempts + 1)
        } else {
          setScoreToPlayer2(player2.scored + 1, player2.attempts + 1)
        }
      }
    }
  }, [time])

  //console.log("camera", cameraPermission);


  const setDelayPushMarked = (time: number) => {
    const t = setTimeout(() => {
      setTime(time)
    }, time * 1000)
    return () => clearTimeout(t)
  }

  const concatStringWithTime = (duration: number, status: string) => {
    return `\n${duration * 1000},${status}\n`
  }

  const saveVideo = async (url: string) => {
    await handleSaveVideo(url)
    setIsVisible(true)
    console.log("save video success");
  }

  const startRecordScreen = async () => {
    const res = await RecordScreen.startRecording({ mic: false, fps: 50 }).catch((error) => console.error(error));
    if (res === RecordingResult.PermissionError) {
      // user denies access
      console.log("PermissionError");
      setIsReplyVideo(true)
      setIsVisible(true)
    }
    if (res === 'started') {
      videoPlayerRef?.current && videoPlayerRef?.current?.seek(0);
      shotPositions.forEach(item => setDelayPushMarked(item?.duration))
    }
  }
  const onSelectModel = () => {
    // load hp model
    // onLoadModel(Model.HP230504, Model.LABEL, (res) => {
    //   console.log('Load HP', res);
    // })
    // tflite.loadModel({
    //   model: Model.HP230504,
    //   labels: Model.LABEL,
    // },
    //   (err: any, res: any) => {
    //     if (err)
    //       console.log(err);
    //     else {
    //       console.log('Load HP', res);
    //     }
    //     //callback(res)
    //   });
    //load pose model
    tflite.loadModelTwo({
      model: Model.POSE_NET,
      labels: Model.LABEL
    },
      (err: any, res: any) => {
        if (err)
          console.log(err);
        else
          console.log('Load posenet', res);
      });
  }

  useEffect(() => {
    //Orientation.lockToLandscape()
    onSelectModel()
    SystemNavigationBar.navigationHide();
    //return () => tflite.close()
  }, [])

  // const requestCameraPermission = useCallback(async () => {
  //   console.log('Requesting camera permission...');
  //   const permission = await Camera.requestCameraPermission();
  //   console.log(`Camera permission status: ${permission}`);

  //   if (permission === 'denied') await Linking.openSettings();
  //   setCameraPermissionStatus(permission);
  // }, []);



  const onLoadModel = (model: any, labels: any, callback: Callback) => {
    tflite.loadModel({
      model: model,
      labels: labels,
    },
      (err: any, res: any) => {
        if (err)
          console.log(err);
        else
          callback(res)
      });
  }

  const detectObjectImage = (uriPath: string, threshold: number, callback: Callback) => {
    tflite.detectObjectOnImage({
      path: uriPath,
      threshold: threshold,
    },
      (err: any, res: any) => {
        if (err)
          console.log(err, 'res');
        else {
          //objRect.ballRecognitions = res
          callback(res)
        }
      });
  }

  const handleDetectHoop = async (path: any) => {
    const uriPath = `${path}1.jpg`
    const response: any = await new Promise((resolve, reject) => {
      detectObjectImage(uriPath, objThreshold, (res) => {
        return resolve(res)
      })
    })
    if (response && response.length > 0) {
      const maxConfidenceInClass = findMaxConfidenceInClass(response)
      const findHoop: PoseRect = response.find(
        (item: PoseRect) => item.confidenceInClass === maxConfidenceInClass
      );
      const body = {
        left: findHoop.rect.x,
        top: findHoop.rect.y,
        height: findHoop.rect.h,
        width: findHoop.rect.w,
        confidenceInClass: findHoop.confidenceInClass,
      }
      setHoopNet(body)
      // load bl model 
      await new Promise((resolve, reject) => {
        onLoadModel(Model.BL230604, Model.LABEL, (res) => {
          console.log('Load bl', res);
          return resolve(res)
        })
      })
    }
  }

  const createPromiseDetect = async ({ path, frameNumber, duration }: ProcessFrames) => {
    const uriPath = `${path}${frameNumber}.jpg`;
    const pose = new Promise((resolve, reject) => {
      tflite.runPoseNetNew({
        path: uriPath,
        threshold: poseThreshold
      },
        (err: any, res: any) => {
          if (err) {
            console.log(err, 'run');
            reject([])
          }
          else {
            const pose = res
            return resolve(pose)
          }
        });
    })
    const ball = new Promise((resolve, reject) => {
      detectObjectImage(uriPath, objThreshold, (res) => {
        const objectImage = res
        return resolve(objectImage)
      })
    })
    Promise.all([await pose, await ball]).then(res => {
      const [pose, objectImage] = res
      const formatDuration = (duration / 1000).toFixed(1)
      const newFrames = {
        duration: formatDuration,
        poseNetRecognitions: pose,
        ballRecognitions: objectImage
      }
      setRecognitionWithDuration([...recognitionWithDuration, newFrames])
    })
  }


  const handleDetectFrames = async (body: ProcessFrames) => {
    await createPromiseDetect(body)
  }

  useEffect(() => {
    if (processDetected?.path) {
      if (processDetected.frameNumber === 1) {
        handleDetectHoop(processDetected.path)
      } else {
        handleDetectFrames(processDetected)
      }
    }
  }, [processDetected])

  const onSelectVideo = async () => {
    setCanSave(true)
    setRecognitionWithDuration([])
    await VideoPickerResponse(async (asset) => {
      if (asset) {
        setLoading(true)
        const w = asset.width ?? 200;
        const h = asset.height ?? 200;
        setWidthFrame(width)
        setHeightFrame(h * width / w)
        const localUri = asset.uri ?? ''
        await createFrames(localUri, 16, (res: ProcessFrames) => {
          if (!res.isProcess) {
            console.log("afafafa", res);

            setProcessDetected(res)
          } else {
            setLoading(false)
            setPathUri(localUri)
          }
        })
      }
    })

  }

  const onLoadVideo = () => {
    console.log("onLoadVideo");
    if (!isReplyVideo) {
      setCanSave(true)
      startRecordScreen()
    }
  }

  const updateTime = ({ currentTime }: any) => {
    console.log(parseFloat(currentTime))
    setCurrentDuration(parseFloat(currentTime.toFixed(1)))
  }

  const processSaveFileCSV = async () => {
    //process save file csv
    Promise.all([await saveLocalFile(headerKeypoints, keypoints, HeaderCsv.keyPoints),
    await saveLocalFile(headerObjectdetections, objectDetect,
      HeaderCsv.objectDetections), await saveLocalFile(headerCritical, criticalMoments, HeaderCsv.criticalMoments)]).then(res => {
        console.log("save file success");
      })
  }

  const handleSaveCsv = (ballRecognitions: PoseRect[]) => {
    const hoopCsv = `${currentDuration * 1000}, ${hoopNet.left}, ${hoopNet.top}, ${hoopNet.width}, ${hoopNet.height},${hoopNet.confidenceInClass}, hoop\n`
    const ballRecognitionNew = ballRecognitions;
    const mapBall = ballRecognitionNew.map((ball: PoseRect) => {
      const { rect, confidenceInClass } = ball
      const ballStr = `\n${currentDuration * 1000}, ${rect.x}, ${rect.y}, ${rect.w}, ${rect.h},${confidenceInClass}, ball\n`
      return ballStr
    })
    setObjectDetect([...objectDetect, hoopCsv, mapBall])
  }


  useEffect(() => {
    if (!isReplyVideo) {
      startRecordScreen()
    }
  }, [isReplyVideo])

  const onPushEventCritical = (duration: number, status: string) => {
    const event = concatStringWithTime(duration, status)
    setCriticalMoments([...criticalMoments, event])
  }

  const findMaxConfidenceInClass = (recognitions: any[]) => {
    const maxConfidenceInClass = Math.max(...recognitions.map((o: PoseRect) => o.confidenceInClass))
    return maxConfidenceInClass
  }
  const handleScoredWhenDetectToModel = (body: Marked, event: string, hasScore: boolean, duration: number) => {
    setShotPositions([...shotPositions, body])
    onPushEventCritical(duration, event)
    if (serveBall) {
      if (hasScore) {
        setScoreToPlayer1(player1.scored + 1, player1.attempts + 1)
      } else {
        setScoreToPlayer1(player1.scored, player1.attempts + 1)
      }
      setServeBall(false)
    } else {
      if (hasScore) {
        setScoreToPlayer2(player2.scored + 1, player2.attempts + 1)
      } else {
        setScoreToPlayer2(player2.scored, player2.attempts + 1)
      }
      setServeBall(true)
    }
  }



  useEffect(() => {
    const filterRecognitions = recognitionWithDuration.length > 0 && recognitionWithDuration.filter((item: any) => parseFloat(item?.duration) === currentDuration)
    // render the the video 
    if (isReplyVideo) {
      if (filterRecognitions.length > 0) {
        const ballRecognitions = filterRecognitions[0].ballRecognitions
        const maxConfidenceInClass = findMaxConfidenceInClass(ballRecognitions)
        const keyPoint = formatKeyPoints(filterRecognitions[0].poseNetRecognitions, currentDuration)
        if (keyPoint && keyPoint.length > 0) {
          setKeyPoints([...keypoints, ...keyPoint])
        }
        handleSaveCsv(ballRecognitions)
        if (!manual) {
          console.log("manual", manual);
          const eyePerson = serveBall ? topEyePlayer1 : topEyePlayer2
          const findBall = ballRecognitions.find((res: PoseRect) => {
            const { x, y, w, h } = res.rect
            const ballTopY = y
            const ballHeight = h
            const ballBottomY = ballTopY + ballHeight;
            const hoopBottomY = hoopNet.top + hoopNet.height
            if (eyePerson > ballBottomY && ballTopY <= hoopBottomY && res.confidenceInClass === maxConfidenceInClass) {
              return true
            }
          })
          if (findBall) {
            const { x, y, w, h } = findBall.rect
            const ballTopY = y
            const ballHeight = h
            const ballLeft = x
            const ballBottomY = ballTopY + ballHeight;
            const hoopBottomY = hoopNet.top + hoopNet.height
            const ballRight = ballLeft + w
            const rightHoop = hoopNet.left + hoopNet.width
            if (hoopNet.top.toFixed(2) <= ballTopY.toFixed(2) && hoopBottomY.toFixed(2) >= ballBottomY.toFixed(2) && hoopNet.left <= ballLeft && ballRight.toFixed(1) <= rightHoop.toFixed(1)) {
              console.log('scored.....');
              const body: Marked = {
                position: findBall?.rect,
                scored: true,
                isServePlayer1: serveBall,
                duration: currentDuration,
              }
              handleScoredWhenDetectToModel(body, EventStatus.scored, true, currentDuration)
            } else {
              console.log('miss.....');
              const body: Marked = {
                position: findBall?.rect,
                scored: false,
                isServePlayer1: serveBall,
                duration: currentDuration,
              }
              handleScoredWhenDetectToModel(body, EventStatus.missed, false, currentDuration)
            }
          }
        }
      }
    }

  }, [currentDuration])

  const renderPoseNet = (filterRecognitions: Recognition[]) => {
    return filterRecognitions[0].poseNetRecognitions.map((res: any, idx: number) => {
      return Object.values(res["keypoints"]).map((kp: any, id) => {
        const left = kp["x"] * widthFrame - 6;
        const top = kp["y"] * heightFrame - 6;
        const width = widthFrame;
        const height = heightFrame;
        if (kp['part'] === 'leftEye' && topEyePlayer1 === 0 || kp['part'] === 'leftEye' && topEyePlayer2 === 0) {
          if (serveBall) {
            topEyePlayer1 = kp["y"];
          } else {
            topEyePlayer2 = kp["y"];
          }
        }
        if (debug && isReplyVideo) {
          const color = idx === 0 ? Colors.primaryBlue : Colors.primaryRed
          return (
            <View key={`${id}_pose_net`} style={{ position: 'absolute', top, left, width, height }}>
              <Text style={{ color: color, fontSize: 12 }}>
                {"● "}
              </Text>
            </View>
          )
        }
        return <View key={`${id}_pose_net`} />
      });
    });
  }
  const renderBall = (filterRecognitions: Recognition[]) => {
    //get score > 0.3 
    return filterRecognitions[0].ballRecognitions.map((res: PoseRect, id: number) => {
      const { rect, confidenceInClass, detectedClass } = res
      const left = rect.x * widthFrame;
      const top = rect.y * heightFrame;
      const width = rect.w * widthFrame;
      const height = rect.h * heightFrame;
      if (confidenceInClass > 0.1 && debug && isReplyVideo) {
        return (
          <View key={id} style={[{ top, left, width, height, position: 'absolute', backgroundColor: 'green' }]}>
            <Text style={{ color: 'white' }}>
              {detectedClass + " " + (confidenceInClass * 100).toFixed(0) + "%"}
            </Text>
          </View>
        )
      }
      return <View key={`${id}_render_ball`} />
    });
  }
  const setScoreToPlayer1 = (scored: number, attempts: number) => {
    const body = {
      scored: scored > 0 ? scored : 0,
      attempts: attempts > 0 ? attempts : 0,
    }
    setPlayer1(body)
  }
  const setScoreToPlayer2 = (scored: number, attempts: number) => {
    const body = {
      scored: scored > 0 ? scored : 0,
      attempts: attempts > 0 ? attempts : 0,
    }
    setPlayer2(body)
  }

  const handleGetShottingPosition = (isServe: boolean, isPlayer1: boolean) => {
    setServeBall(isServe)
    const filterRecognition = recognitionWithDuration.length > 0 && recognitionWithDuration.find((item: any) => item?.duration >= currentDuration)
    if (filterRecognition) {
      const ballRecognitions = filterRecognition?.ballRecognitions
      const body: Marked = {
        position: ballRecognitions[0]?.rect,
        scored: true,
        isServePlayer1: isPlayer1,
        duration: currentDuration,
      }
      setShotPositions([...shotPositions, body])
    }
  }
  const onSwitchPlayer = (isPlayerHasBall: boolean) => {
    setServeBall(isPlayerHasBall)
  }

  const onRemoveMarked = () => {
    let removed = shotPositions
    let lastShot = removed.splice(-1)[0];
    if (shotPositions.length === 0) {
      setScoreToPlayer1(0, 0)
      setScoreToPlayer2(0, 0)
    }

    // check player1 has scored
    if (lastShot?.isServePlayer1) {
      if (lastShot?.scored) {
        setScoreToPlayer1(player1.scored - 1, player1.attempts - 1)
      } else {
        setScoreToPlayer1(player1.scored, player1.attempts - 1)
      }
    } else {
      if (lastShot?.scored) {
        setScoreToPlayer2(player2.scored - 1, player2.attempts - 1)
      } else {
        setScoreToPlayer2(player2.scored, player2.attempts - 1)
      }
    }
    setShotPositions([...removed])

  }

  const handleMissShotPlayer = (serveBall: boolean, isPlayer1: boolean) => {
    setServeBall(serveBall)
    const filterMissBall = recognitionWithDuration.length > 0 && recognitionWithDuration.find((item: any) => Number(item?.duration) >= currentDuration)
    if (filterMissBall) {
      const scored = filterMissBall?.ballRecognitions
      if (scored && scored.length > 0) {
        const body: Marked = {
          position: scored[0]?.rect,
          scored: false,
          isServePlayer1: isPlayer1,
          duration: currentDuration,
        }
        const newShotting = [...shotPositions, body]
        setShotPositions(newShotting)
      }
    }
  }

  const handleSaveRecordVideo = async () => {
    try {
      const res = await RecordScreen.stopRecording().catch((error) =>
        console.warn(error, "stopRecording")
      );
      if (res?.status === 'success') {
        const url = res.result.outputURL;
        saveVideo(url)
      } else {
        setIsVisible(true)
      }
    } catch (error) {
      console.log("Record error", error);
      setIsVisible(true)
    }
  }



  const onEndVideo = async () => {
    if (canSave) {
      if (isReplyVideo) {
        processSaveFileCSV()
        setCanSave(false)
        setIsReplyVideo(false)
        setPlayer1({
          scored: 0,
          attempts: 0,
        })
        setPlayer2({
          scored: 0,
          attempts: 0,
        })
        setServeBall(true)
      }
      console.log("end1");
    } else {
      handleSaveRecordVideo()
    }

  }
  if (loading) {
    return <LoadingOverlay isVisible={loading} />
  }

  const getMarked = () => {
    if (isReplyVideo) {
      if (shotPositions.length > 0) {
        return shotPositions
      }
      return []
    } else {
      if (tempMarked.length > 0) {
        return tempMarked
      }
      return []
    }
  }
  const filterRecognitions = recognitionWithDuration.length > 0 && recognitionWithDuration.filter((item: any) => parseFloat(item?.duration) === currentDuration)
  const mapMarked = getMarked()

  const onPushScoredPlayer = (isPlayer1: boolean) => {
    if (isPlayer1) {
      setScoreToPlayer1(player1.scored + 1, player1.attempts + 1)
      handleGetShottingPosition(true, true)
    } else {
      setScoreToPlayer2(player2.scored + 1, player2.attempts + 1)
      handleGetShottingPosition(false, false)
    }
    onPushEventCritical(currentDuration, EventStatus.mScored)
  }

  const onPushMissScored = (isPlayer1: boolean) => {
    if (isPlayer1) {
      setScoreToPlayer1(player1.scored, player1.attempts + 1)
      handleMissShotPlayer(false, true)
    } else {
      setScoreToPlayer2(player2.scored, player2.attempts + 1)
      handleMissShotPlayer(true, false)
    }
    onPushEventCritical(currentDuration, EventStatus.mMissed)
  }

  const onExitApp = () => {
    BackHandler.exitApp();
    navigation.goBack()
  }
  const onGoBack = () => {
    navigation.goBack()
    setIsVisible(false)
  }

  const marginRight = isAndroid ? navHeightBottom : 0
  return (
    <Fragment>
      <StatusBar backgroundColor={'transparent'} barStyle={'light-content'} hidden showHideTransition={'none'} />
      <View style={[styles.container, { marginTop: StatusBar.currentHeight, marginRight: marginRight }]} >
        {!pathUri && <TouchableOpacity style={{ zIndex: 100 }} onPress={onSelectVideo}>
          <Text style={styles.text}>Select Video</Text>
        </TouchableOpacity>}
        {pathUri && <View style={
          [styles.imageContainer, {
            borderWidth: pathUri ? 0 : 2
          }]}>
          <Video source={{ uri: pathUri }}
            ref={(ref: any) => {
              videoPlayerRef = ref
            }}
            repeat={isReplyVideo}
            fullScreen={true}
            onLoad={onLoadVideo}
            onProgress={updateTime}
            resizeMode={"cover"}
            onEnd={onEndVideo}
            style={{ height: heightFrame, width: widthFrame }} />
        </View>}
        {debug && isReplyVideo && <View style={{ top: 20, left: 10, position: 'absolute' }}>
          <View style={styles.row}>
            <View >
              <PlayerCard backgroundColor={serveBall ? Colors.primaryGreen : 'transparent'} title={`Player 1: ${player1.scored}/${player1.attempts}`} />
              <View style={{ height: 4 }} />
              <PlayerCard backgroundColor={!serveBall ? Colors.primaryGreen : 'transparent'} title={`Player 2: ${player2.scored}/${player2.attempts}`} />
            </View>
          </View>
        </View>}
        {(manual || debug) && isReplyVideo && <View style={{ bottom: 30, left: 30, right: 30, position: 'absolute', zIndex: 1000 }}>
          <View style={styles.row}>
            <View style={{ justifyContent: 'center' }}>
              <TouchableOpacity style={{ marginBottom: 40 }} onPress={() => onPushEventCritical(currentDuration, EventStatus.mShot)}>
                <Image source={icons.arrowUp} style={styles.icon} resizeMode="contain" />
              </TouchableOpacity>
              <OverWriteButton backgroundColor={Colors.primaryBlue} backgroundColorInside={Colors.black} onPress={() => onPushScoredPlayer(true)} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ButtonCard
                  onPress={() => onPushMissScored(true)}
                  icon={icons.closeBlue}
                  style={{ marginTop: 30 }} />
                <ButtonCard
                  onPress={() => onSwitchPlayer(false)}
                  icon={icons.arrowDown}
                  style={{ marginLeft: 30, marginTop: 30 }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <ButtonCard
                onPress={() => onSwitchPlayer(true)}
                icon={icons.arrowDown}
                tintColor={Colors.white}
                style={{ marginRight: 30 }} />
              <View>
                <ButtonCard
                  onPress={() => onPushEventCritical(currentDuration, EventStatus.mShot)}
                  icon={icons.arrowUp}
                  tintColor={Colors.primaryRed}
                  style={{ marginBottom: 40 }} />
                <OverWriteButton onPress={() => onPushScoredPlayer(false)} />
                <ButtonCard
                  onPress={() => onPushMissScored(false)}
                  icon={icons.closeRed}
                  style={{ marginTop: 30 }} />
              </View>
            </View>
          </View>
        </View>}
        {debug && isReplyVideo && <View style={{
          position: 'absolute',
          top: hoopNet.top * heightFrame,
          left: hoopNet.left * widthFrame,
          width: hoopNet.width * widthFrame,
          borderWidth: 1,
          borderColor: 'blue',
          height: hoopNet.height * heightFrame
        }} />}
        {debug && isReplyVideo && <View style={{ position: 'absolute', left: heightFrame / 3, top: 10 }}>
          <Text style={{ color: Colors.white }}>{`Time: ${currentDuration * 1000}`}</Text>
        </View>}
        {(manual || debug) && isReplyVideo ? <TouchableOpacity style={[styles.btnRemove, { left: width / 2, zIndex: 1000 }]} onPress={onRemoveMarked} /> : null}
        <View style={styles.board}>
          <ScoreBardCard mWidth={width / 5}
            namePlayer1={namePlayer1}
            namePlayer2={namePlayer2}
            scoredPlayer1={player1.scored}
            scoredPlayer2={player2.scored}
          />
          <View >
            <ImageBackground imageStyle={{ opacity: 0.1, backgroundColor: 'rgba(52, 52, 52, 0.5)', zIndex: 100 }} source={icons.markBoard} style={{ width: 100, height: 80, }} >
              {mapMarked.map((item, index) => {
                const left = item?.position?.x ? item?.position?.x * 100 : 0
                const top = item?.position?.y ? item?.position?.y * 80 : 0
                if (item?.scored) {
                  return <View key={index} style={[styles.scored, {
                    left: left,
                    top: top,
                  }]} />
                }
                return <ImageBackground source={icons.deleteIcon} imageStyle={{
                  opacity: 0.5, tintColor: 'red', left: left, position: 'absolute', zIndex: 100,
                  top: top,
                }} style={{ width: 10, height: 10, position: 'absolute' }} />
              })}
            </ImageBackground>
          </View>
        </View>
        <View style={styles.boxes}>
          {filterRecognitions.length > 0 && renderPoseNet(filterRecognitions)}
          {filterRecognitions.length > 0 && renderBall(filterRecognitions)}
        </View>
      </ View>
      <Modal supportedOrientations={['portrait', 'landscape']} visible={isVisible} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <Text>Your file has been annotated!</Text>
          <TouchableOpacity style={{ marginTop: 12 }} onPress={onGoBack}>
            <Text style={{ textDecorationLine: 'underline', color: Colors.primaryBlue }}>Annotated another file</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onExitApp}>
            <Text style={{ marginTop: 12, textDecorationLine: 'underline', color: Colors.primaryBlue }}>Quit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Fragment >
  )
}
export default PoseDetection