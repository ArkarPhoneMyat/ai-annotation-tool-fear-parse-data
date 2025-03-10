//
//  FramePluginProcess.swift
//  annotation
//
//  Created by Macintosh on 7/5/23.
//

import AVKit
import Vision
import Accelerate

@objc(FramePluginProcess)
public class FramePluginProcess: NSObject, FrameProcessorPluginBase {
  //private var poseEstimato: PoseNet?
  let queue = DispatchQueue(label: "serial_queue")
  @objc
  public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    guard let  imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return nil
    }
    return [];
  }
}
//    guard let  imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
//      return nil
//    }
//    let pixelBuffer: CVPixelBuffer? = CMSampleBufferGetImageBuffer(frame.buffer)
//
//        guard let imagePixelBuffer = pixelBuffer else {
//          return nil
//        }
//    do {
//
//      if let poseEstimator = FrameCamera.poseEstimator {
//       // CVPixelBufferLockBaseAddress(pixelBuffer, CVPixelBufferLockFlags.readOnly)
////        NSLog("ExamplePlugin: \(CVPixelBufferGetWidth(imagePixelBuffer)) x \(CVPixelBufferGetHeight(imagePixelBuffer)) Image. Logging \(args.count) parameters:")
//        var returned_results: [Any] = []
//        let (result, _times) = try poseEstimator.estimateSinglePose(
//          on: imagePixelBuffer)
//        //dump(result.score)
//        //dump(_times)
//
//        returned_results.append(Utils.wrapPersonResult(result: result))
//       // CVPixelBufferUnlockBaseAddress(pixelBuffer, CVPixelBufferLockFlags.readOnly)
//        return returned_results
//      }
//
//
//      // Return to main thread to show detection results on the app UI.
//    } catch {
//      NSLog("ket", false)
//      //os_log("Error running pose estimation.", type: .error)
//      return [];
//    }
//    NSLog("ket", false)
//    return []
//  }
//  func getPixelBuffer(from buffer: vImage_Buffer, width: Int, height: Int) -> CVPixelBuffer? {
//      var buffer = buffer
//      let bitmapInfo = CGBitmapInfo(rawValue: CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.first.rawValue)
//      var cgFormat = vImage_CGImageFormat(bitsPerComponent: 8,
//                                          bitsPerPixel: 32,
//                                          colorSpace: nil,
//                                          bitmapInfo: bitmapInfo,
//                                          version: 0,
//                                          decode: nil,
//                                          renderingIntent: .defaultIntent)
//      let cvFormat = vImageCVImageFormat_Create(kCVPixelFormatType_32BGRA,
//                                                kvImage_ARGBToYpCbCrMatrix_ITU_R_709_2,
//                                                kCVImageBufferChromaLocation_TopLeft,
//                                                CGColorSpaceCreateDeviceRGB(), 0).takeRetainedValue()
//
//      var pixelBuffer: CVPixelBuffer?
//      let status = CVPixelBufferCreate(kCFAllocatorDefault,
//                                       width,
//                                       height,
//                                       kCVPixelFormatType_32BGRA,
//                                       nil,
//                                       &pixelBuffer)
//      guard status == kCVReturnSuccess else { return nil }
//
//      let error = vImageBuffer_CopyToCVPixelBuffer(&buffer,
//                                                   &cgFormat,
//                                                   pixelBuffer!,
//                                                   cvFormat,
//                                                   nil,
//                                                   vImage_Flags(0))
//      guard error == kvImageNoError else { return nil }
//
//      return pixelBuffer
//  }
  
  

      
    

//  private func runModel(_ pixelBuffer: CVPixelBuffer) {
//      // Guard to make sure that there's only 1 frame process at each moment.
//      guard !isRunning else { return }
//
//      // Guard to make sure that the pose estimator is already initialized.
//      guard let estimator = poseEstimator else { return }
//
//      // Run inference on a serial queue to avoid race condition.
//
//  }
