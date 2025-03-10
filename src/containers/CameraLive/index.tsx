import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Linking, StyleSheet, View, useWindowDimensions } from "react-native"
import { Button, Text } from "@/components"
import Reanimated, { Extrapolate, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import {
  CameraDeviceFormat,
  CameraRuntimeError,
  FrameProcessorPerformanceSuggestion,
  PhotoFile,
  sortFormats,
  useCameraDevices,
  useFrameProcessor,
  VideoFile,
  Camera,
  frameRateIncluded,
  CameraPermissionStatus,
  Frame,
  useTensorflowModel,
} from 'react-native-vision-camera';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import { useIsForeground } from '@/hook/useIsForeground';
import { Model, isAndroid } from '@/utils/Device';
import { processFramePlugin } from './ProcessFrame';
import { FrameProcessorConfig, PoseRect, Recognition } from '@/types/posenet';
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
import Tflite from 'tflite-react-native';
import { useCustomModel } from './Constant';
import { Colors } from '@/assets/styles';
import { useDeviceRotationSensor } from '@/hook/useDeviceRotationSensor';

interface Callback {
  (res: any): void;
}
Reanimated.addWhitelistedNativeProps({
  zoom: false,
});

let tflite1 = new Tflite();

// const frameProcess: FrameProcessorConfig = {
//   model: '', // <!-- name and extension of your model
//   scoreThreshold: 0.5,
// };

//const TensorCamera = cameraWithTensors(Camera)

declare let _WORKLET: true | undefined;

// export function examplePlugin(frame: Frame): string[] {
//   'worklet';
//   if (!_WORKLET) throw new Error('examplePlugin must be called from a frame processor!');
//   console.log("framee", frame);

//    //@ts-expect-error because this function is dynamically injected by VisionCamera
//   return __example_plugin(frame, 'hello!', 'parameter2', true, 42, { test: 0, second: 'test' }, ['another test', 5]);
// }
const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;
const MAX_ZOOM_FACTOR = 20;
const CameraLive = () => {
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [enableNightMode, setEnableNightMode] = useState(false);
  const [active, setActive] = useState(false)
  const [poseNet, setPoseNet] = useState([])
  const [balls, setBall] = useState<any[]>([])
  const { height, width, scale } = useWindowDimensions()
  const [hoopNet, setHoopNet] = useState({
    height: 0, left: 0, top: 0, width: 0, confidenceInClass: 0,
  })

  const [cameraOrientation, setCameraOrientation] = useState<string>('portrait' || undefined)

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo<CameraDeviceFormat[]>(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  // useDeviceRotationSensor((rotation) => {
  //   // These still work when the device orientation is unlocked
  //   setCameraOrientation('landscapeRight');
  //   if (rotation === 'top') setCameraOrientation('portrait');
  //   if (rotation === 'right') setCameraOrientation('landscapeLeft');
  //   if (rotation === 'down') setCameraOrientation('portraitUpsideDown');
  //   if (rotation === 'left') setCameraOrientation('landscapeRight');
  // });

  //#region Memos
  const [is60Fps, setIs60Fps] = useState(true);
  const fps = useMemo(() => {
    if (!is60Fps) return 30;

    if (enableNightMode && !device?.supportsLowLightBoost) {
      // User has enabled Night Mode, but Night Mode is not natively supported, so we simulate it by lowering the frame rate.
      return 30;
    }

    const supportsHdrAt60Fps = formats.some((f) => f.supportsVideoHDR && f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if (enableHdr && !supportsHdrAt60Fps) {
      // User has enabled HDR, but HDR is not supported at 60 FPS.
      return 30;
    }

    const supports60Fps = formats.some((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if (!supports60Fps) {
      // 60 FPS is not supported by any format.
      return 30;
    }
    // If nothing blocks us from using it, we default to 60 FPS.
    return 60;
  }, [device?.supportsLowLightBoost, enableHdr, enableNightMode, formats, is60Fps]);

  const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = useMemo(() => formats.some((f) => f.supportsVideoHDR || f.supportsPhotoHDR), [formats]);
  const supports60Fps = useMemo(() => formats.some((f) => f.frameRateRanges.some((rate) => frameRateIncluded(rate, 60))), [formats]);
  const canToggleNightMode = enableNightMode
    ? true // it's enabled so you have to be able to turn it off again
    : (device?.supportsLowLightBoost ?? false) || fps > 30; // either we have native support, or we can lower the FPS
  //#endregion

  const format = useMemo(() => {
    let result = formats;
    if (enableHdr) {
      // We only filter by HDR capable formats if HDR is set to true.
      // Otherwise we ignore the `supportsVideoHDR` property and accept formats which support HDR `true` or `false`
      result = result.filter((f) => f.supportsVideoHDR || f.supportsPhotoHDR);
    }

    // find the first format that includes the given FPS
    return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)));
  }, [formats, fps, enableHdr]);

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Callbacks
  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );
  // Camera callbacks
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
  }, []);
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);
  // const onMediaCaptured = useCallback(
  //   (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
  //     console.log(`Media captured! ${JSON.stringify(media)}`);
  //     navigation.navigate('MediaPage', {
  //       path: media.path,
  //       type: type,
  //     });
  //   },
  //   [navigation],
  // );
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'));
  }, []);
  //#endregion

  //#region Tap Gesture
  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);
  //#endregion

  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  useEffect(() => {
    // Orientation.lockToLandscape()
    Camera.getMicrophonePermissionStatus().then((status) => setHasMicrophonePermission(status === 'authorized'));
  }, []);
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP);
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP);
    },
  });
  //#endregion

  if (device != null && format != null) {
    console.log(
      `Re-rendering camera page with ${isActive ? 'active' : 'inactive'} camera. ` +
      `Device: "${device.name}" (${format.photoWidth}x${format.photoHeight} @ ${fps}fps)`,
    );
  } else {
    console.log('re-rendering camera page without active camera');
  }

  const frameProcessorConfig: FrameProcessorConfig = {
    model: Model.POSE_NET ?? 'hp230504.tflite', // <!-- name and extension of your model
    scoreThreshold: 0.5,
    maxResults: 1,
    numThreads: 4,
  };

  const onLoadModel = (model: any, labels: any, callback: Callback) => {
    tflite1.loadModel({
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

  const onSelectModel = () => {
    //load pose model
    tflite1.loadModelTwo({
      model: Model.HP230504,
      labels: Model.LABEL
    },
      (err: any, res: any) => {
        if (err)
          console.log(err);
        else {
          console.log('Load posenet', res);
          // setActive(true)
        }
      });
    // load hp model
    onLoadModel(Model.BL230604, Model.LABEL, (res) => {
      console.log('Load HP', res);
      setActive(true)
    })
  }
  useEffect(() => {
    onSelectModel()
  }, [])

  const findMaxConfidenceInClass = (recognitions: any[]) => {
    const maxConfidenceInClass = Math.max(...recognitions.map((o: PoseRect) => o.confidenceInClass))
    return maxConfidenceInClass
  }

  const findHoop = async (Hoop: any[]) => {
    const maxConfidenceInClass = await findMaxConfidenceInClass(Hoop)
    const findHoop: PoseRect = Hoop.find(
      (item: PoseRect) => item.confidenceInClass === maxConfidenceInClass
    );
    const hoop = {
      left: findHoop?.rect.x,
      top: findHoop?.rect.y,
      height: findHoop?.rect.h,
      width: findHoop?.rect.w,
      confidenceInClass: findHoop?.confidenceInClass,
    }
    return hoop
  }

  const findBall = async (Ball: any[]) => {
    const maxConfidenceInClassBall = await findMaxConfidenceInClass(Ball)
    const ball: PoseRect[] = Ball.filter(
      (item: PoseRect) => item.confidenceInClass === maxConfidenceInClassBall
    );
    return ball
  }


  const dataProcess = async (value: any) => {
    const { Ball, Hoop } = value[0]
    const [hoop, ball] = await Promise.all([await findHoop(Hoop), await findBall(Ball)])
    setHoopNet(hoop)
    const ball: any[] = await findBall(Ball)
    setBall(ball)
    // console.log("ballssss", Pose);

    // if (Pose) {
    //   setPoseNet(Pose)
    // }
  }

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const value = processFramePlugin(frame, frameProcessorConfig)
      console.log("valueeee", value);


      runOnJS(dataProcess)(value)
    },
    [],
  );
  const renderPose = (filterRecognitions: Recognition[]) => {
    return filterRecognitions.map((res: any, idx: number) => {
      return Object.values(res["keypoints"]).map((kp: any, id) => {
        const left = kp["x"] * width - 6;
        const top = kp["y"] * height - 6;

        console.log("lefttttt", left);

        // const width = width;
        // const height = height;
        // if (kp['part'] === 'leftEye' && topEyePlayer1 === 0 || kp['part'] === 'leftEye' && topEyePlayer2 === 0) {
        //   if (serveBall) {
        //     topEyePlayer1 = kp["y"];
        //   } else {
        //     topEyePlayer2 = kp["y"];
        //   }
        // }
        const color = idx === 0 ? Colors.primaryBlue : Colors.primaryRed
        return (
          <View key={`${id}_pose_net`} style={{ position: 'absolute', top, left, width, height }}>
            <Text style={{ color: color, fontSize: 12 }}>
              {"● "}
            </Text>
          </View>
        )

        return <View key={`${id}_pose_net`} />
      });
    });
  }

  const renderPoseNet = (filterRecognitions: any[]) => {

    return filterRecognitions[0]?.keypoints?.map((res: any, idx: number) => {
      const left = res["x"]
      const top = res["y"]
      // const width = width
      // const height = heightFrame;
      return (
        <View key={`${idx}_pose_net`} style={{ position: 'absolute', top: top, left, width, height }}>
          <Text style={{ color: Colors.primaryRed, fontSize: 12 }}>
            {"● "}
          </Text>
        </View>
      )
    });
  }
  const renderBall = (filterRecognitions: Recognition[]) => {
    //get score > 0.3 
    return filterRecognitions?.map((res: PoseRect, id: number) => {
      const { rect, confidenceInClass, detectedClass } = res
      const left = rect.x * width;
      const top = rect.y * height;
      const widthW = rect.w * width;
      const heightW = rect.h * height;
      return (
        <View key={id} style={[{ top, left, width: widthW, height: heightW, position: 'absolute', backgroundColor: 'green' }]}>
          <Text style={{ color: 'white' }}>
            {detectedClass + " " + (confidenceInClass * 100).toFixed(0) + "%"}
          </Text>
        </View>
      )

      return <View key={`${id}_render_ball`} />
    });
  }
  return (
    <View style={styles.container}>
      {device != null && active && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
              <ReanimatedCamera
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                fps={fps}
                hdr={enableHdr}
                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                isActive={isActive}
                onInitialized={onInitialized}
                //onError={onError}
                enableZoomGesture={false}
                animatedProps={cameraAnimatedProps}
                photo={true}
                video={true}
                //audio={hasMicrophonePermission}
                frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined}
                orientation={cameraOrientation}
                frameProcessorFps={1}
              //onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable}
              />
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}
      {hoopNet && <View style={{
        position: 'absolute',
        top: hoopNet.top * height,
        left: hoopNet.left * width,
        width: hoopNet.width * width,
        borderWidth: 1,
        borderColor: 'blue',
        height: hoopNet.height * height
      }} />}
      <View style={styles.boxes}>
        {/* {poseNet.length > 0 && renderPose(poseNet)} */}
        {balls.length > 0 && renderBall(balls)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'black',
  },
  boxes: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  }
});

export default CameraLive