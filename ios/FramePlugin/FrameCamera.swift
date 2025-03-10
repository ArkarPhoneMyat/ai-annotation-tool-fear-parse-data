//
//  FrameCamera.swift
//  annotation
//
//  Created by Macintosh on 7/6/23.
//
@objc(FrameCamera)
class FrameCamera: NSObject {
  // static var poseEstimator: PoseNet?
  private var threadCount: Int = Constants.defaultThreadCount
  private var delegate: Delegates = Constants.defaultDelegate
  @objc(useCustomModel:withResolver:withRejecter:)
      func useCustomModel(customModelConfig:[String:Any], resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
          let modelFolder = customModelConfig["customModelFolder"] as! String
          let modelFileNames = customModelConfig["customModelFileNames"] as! [String]
        
        // do {
        //   FrameCamera.poseEstimator = try PoseNet.init(
        //     threadCount: self.threadCount,
        //     delegate: self.delegate)
        //     } catch {
        //         print(error)
        //     }
        //   resolve(true)
      }
}
enum Constants {
  // Configs for the TFLite interpreter.
  static let defaultThreadCount = 4
  static let defaultDelegate: Delegates = .gpu
  static let defaultModelType: ModelType = .movenetThunder

  // Minimum score to render the result.
  static let minimumScore: Float32 = 0.2
}
