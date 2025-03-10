////
////  FrameResizer.h
////  annotation
////
////  Created by Macintosh on 7/2/23.
////
//
//#import <memory>
//#import <Foundation/Foundation.h>
//#import <Accelerate/Accelerate.h>
//#import <AVFoundation/AVFoundation.h>
//#include "tensorflow/lite/objc/apis/TFLTensorFlowLite.h"
//
//class FrameResizerr {
//public:
//  explicit FrameResizerr(size_t targetWidth, size_t targetHeight, size_t channels, TFLTensorDataType dataType);
//  ~FrameResizerr();
//
//  /**
//   Resize the given Frame to the target dimensions and pixel formats.
//   */
//  const vImage_Buffer& resizeFrame(CVPixelBufferRef pixelBuffer);
//
//private:
//  vImage_Buffer _inputDownscaledBuffer;
//  vImage_Buffer _inputReformattedBuffer;
//
//  // target image with (e.g. 192)
//  size_t _targetWidth;
//  // target image height (e.g. 192)
//  size_t _targetHeight;
//  // target image bytes per row (e.g. 192*192*3)
//  size_t _targetBytesPerRow;
//  // target image channels (e.g. 3 for RGB, 4 for RGBA)
//  size_t _targetChannels;
//  // target image data type (e.g. UInt8)
//  TFLTensorDataType _targetDataType;
//};
