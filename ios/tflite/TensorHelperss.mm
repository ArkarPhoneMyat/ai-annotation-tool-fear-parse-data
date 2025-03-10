////
////  TensorHelpers.m
////  annotation
////
////  Created by Macintosh on 7/2/23.
////
//#import "TensorHelperss.h"
//#import <Foundation/Foundation.h>
//#import <Accelerate/Accelerate.h>
//
//using namespace vision;
//size_t getTFLTensorDataTypeSize(TFLTensorDataType dataType) {
//  switch (dataType) {
//    case TFLTensorDataTypeUInt8:
//      return sizeof(uint8_t);
//    case TFLTensorDataTypeInt8:
//      return sizeof(int8_t);
//    case TFLTensorDataTypeInt16:
//      return sizeof(int16_t);
//    case TFLTensorDataTypeInt32:
//      return sizeof(int32_t);
//    case TFLTensorDataTypeFloat32:
//      return sizeof(float32_t);
//    case TFLTensorDataTypeFloat64:
//      return sizeof(float64_t);
//
//    case TFLTensorDataTypeFloat16:
//    case TFLTensorDataTypeBool:
//    case TFLTensorDataTypeInt64:
//    default:
//      throw std::runtime_error(std::string("Unsupported output data type! ") + std::to_string(dataType));
//  }
//}
//size_t getTensorBufferSize(TFLTensor* tensor) {
//  NSError* error;
//  NSArray<NSNumber*>* shape = [tensor shapeWithError:&error];
//  if (error != nil) {
//    throw std::runtime_error(std::string("Failed to get tensor's shape! ") + error.description.UTF8String);
//  }
//  if (shape.count < 1) {
//    NSLog(@"Warning: Tensor \"%@\" has a shape of [] (zero). There is something wrong with this Tensor..", tensor.name);
//    return 0;
//  }
//
//  size_t size = 1;
//  for (NSNumber* n in shape) {
//    size *= n.unsignedIntValue;
//  }
//  return size;
//}
