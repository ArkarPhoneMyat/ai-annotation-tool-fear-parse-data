//
//  Utils.swift
//  annotation
//
//  Created by Macintosh on 7/6/23.
//

import Foundation

class Utils {
  static func wrapPersonResult (result:Person) -> [String: Any] {
          var dict: [String: Any] = [:]
    dict["score"] = result.score
    var keyPoints: [[String:Any]] = []
//    var bodyPartToDotMap: [BodyPart: CGPoint] = [:]
//        for (index, part) in BodyPart.allCases.enumerated() {
//          let position = CGPoint(
//            x: result.keyPoints[index].coordinate.x,
//            y: result.keyPoints[index].coordinate.y)
//          bodyPartToDotMap[part] = position
//        }
    for keypoint in result.keyPoints {
      let keyPoint : [String: Any] = wrapKeyPoints(keypoint: keypoint)
      keyPoints.append(keyPoint)
    }
    dict["keypoints"] = keyPoints
   //dict["keyPoints"] = wrapKeyPoints(keypoint: result.keyPoints)
//    var lineResults: [[String:Any]] = []
//    for lineResult in result.lineResults! {
//        let lineResultDict: [String: Any] = wrapDLRLineResult(result: lineResult)
//            lineResults.append(lineResultDict)
//          }
//          dict["lineResults"] = lineResults
                  
          return dict
      }
  static private func wrapKeyPoints (keypoint:KeyPoint) -> [String: Any] {
          var dict: [String: Any] = [:]
    dump(keypoint)
//    var bodyPartToDotMap: [BodyPart: CGPoint] = [:]
//        for (index, part) in BodyPart.allCases.enumerated() {
//          let position = CGPoint(
//            x: keypoint.bodyPart,
//            y: keypoint.bodyPart.coordinate.y)
//          bodyPartToDotMap[part] = position
//        }
//    dict["bodyPart"] = bodyPartToDotMap
    dict["score"] = keypoint.score
   // var pointDict: [String:CGFloat] = [:]
    dict["x"] = keypoint.coordinate.x
    dict["y"] = keypoint.coordinate.y
    dict["part"] = keypoint.bodyPart.rawValue
   // dict["coordinate"] = pointDict
        return dict
      }
}
