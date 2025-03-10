import React from 'react';
import { Text } from "@/components";
import { View } from "react-native";
import { PoseRect, Recognition } from '@/types/posenet';


interface Props {
  recognitions: Recognition[],
  isReplyVideo: boolean,
  widthFrame: number,
  heightFrame: number,
  debug: boolean,
}

const BallCard = ({ recognitions, isReplyVideo, widthFrame, heightFrame, debug }: Props) => {
  const ballRecognitions = recognitions[0]?.ballRecognitions
  return ballRecognitions.map((res: PoseRect, id: number) => {
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
  })
}

export default BallCard