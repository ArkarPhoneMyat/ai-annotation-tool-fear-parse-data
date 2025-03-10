//
//  LiveObjectDetectionProcessPlugin.m
//  annotation
//
//  Created by Macintosh on 6/29/23.
//

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/Frame.h>

//
#import <React/RCTLog.h>
#include <pthread.h>
#include <unistd.h>
#include <fstream>
#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#import <UIKit/UIKit.h>

#ifdef CONTRIB_PATH
#include "tensorflow/contrib/lite/kernels/register.h"
#include "tensorflow/contrib/lite/model.h"
#include "tensorflow/contrib/lite/string_util.h"
#include "tensorflow/contrib/lite/op_resolver.h"
#else
#include "tensorflow/lite/kernels/register.h"
#include "tensorflow/lite/model.h"
#include "tensorflow/lite/string_util.h"
#include "tensorflow/lite/op_resolver.h"
#include "tensorflow/lite/c/c_api.h"
#endif


#import "load_image.h"
#define LOG(x) std::cerr


std::unique_ptr<tflite::FlatBufferModel> modelLive;
std::unique_ptr<tflite::Interpreter> interpreterl;

// Example for an Objective-C Frame Processor plugin

@interface LiveObjectDetectionProcessPlugin : NSObject
//+ (TFLObjectDetector*)detector:(NSDictionary*)config;
//+ (UIImage*)resizeFrameToUIimage:(Frame*)frame;
@end

void feedInputTensorLive(uint8_t* in, int* input_size, int image_height, int image_width, int image_channels, float input_mean, float input_std) {
  assert(interpreterl->inputs().size() == 1);
  int input = interpreterl->inputs()[0];
  TfLiteTensor* input_tensor = interpreterl->tensor(input);
  const int input_channels = input_tensor->dims->data[3];
  const int width = input_tensor->dims->data[2];
  const int height = input_tensor->dims->data[1];
  *input_size = width;
  
  if (input_tensor->type == kTfLiteUInt8) {
    uint8_t* out = interpreterl->typed_tensor<uint8_t>(input);
    for (int y = 0; y < height; ++y) {
      const int in_y = (y * image_height) / height;
      uint8_t* in_row = in + (in_y * image_width * image_channels);
      uint8_t* out_row = out + (y * width * input_channels);
      for (int x = 0; x < width; ++x) {
        const int in_x = (x * image_width) / width;
        uint8_t* in_pixel = in_row + (in_x * image_channels);
        uint8_t* out_pixel = out_row + (x * input_channels);
        for (int c = 0; c < input_channels; ++c) {
          out_pixel[c] = in_pixel[c];
        }
      }
    }
  } else { // kTfLiteFloat32
    float* out = interpreterl->typed_tensor<float>(input);
    for (int y = 0; y < height; ++y) {
      const int in_y = (y * image_height) / height;
      uint8_t* in_row = in + (in_y * image_width * image_channels);
      float* out_row = out + (y * width * input_channels);
      for (int x = 0; x < width; ++x) {
        const int in_x = (x * image_width) / width;
        uint8_t* in_pixel = in_row + (in_x * image_channels);
        float* out_pixel = out_row + (x * input_channels);
        for (int c = 0; c < input_channels; ++c) {
          out_pixel[c] = (in_pixel[c] - input_mean) / input_std;
        }
      }
    }
  }
}

//void feedInputTensorImage(const NSString* image_path, float input_mean, float input_std, int* input_size) {
//  int image_channels;
//  int image_height;
//  int image_width;
//  std::vector<uint8_t> image_data = LoadImageFromFrame([image_path UTF8String], &image_width, &image_height, &image_channels);
//  uint8_t* in = image_data.data();
//  feedInputTensorLive(in, input_size, image_height, image_width, image_channels, input_mean, input_std);
//}
@implementation LiveObjectDetectionProcessPlugin

//+ (TFLObjectDetector*)detector:(NSDictionary*)config {
//  static TFLObjectDetector* detector = nil;
//  if (detector == nil) {
//    NSString* filename = config[@"modelFile"];
//    NSString* extension = [filename pathExtension];
//    NSString* modelName = [filename stringByDeletingPathExtension];
//    NSString* modelPath = [[NSBundle mainBundle] pathForResource:modelName
//                                                          ofType:extension];
//
//    NSNumber* scoreThreshold = config[@"scoreThreshold"];
//    NSNumber* maxResults = config[@"maxResults"];
//    NSNumber* numThreads = config[@"numThreads"];
//    TFLObjectDetectorOptions* options =
//        [[TFLObjectDetectorOptions alloc] initWithModelPath:modelPath];
//    options.classificationOptions.scoreThreshold =
//        scoreThreshold.floatValue;
//    options.classificationOptions.maxResults =
//        maxResults.intValue;
//    options.baseOptions.computeSettings.cpuSettings.numThreads = numThreads.intValue;
//    detector = [TFLObjectDetector objectDetectorWithOptions:options error:nil];
//  }
//  return detector;
//}
//+ (UIImage*)resizeFrameToUIimage:(Frame*)frame {
//  CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer);
//
//  CIImage* ciImage = [CIImage imageWithCVPixelBuffer:imageBuffer];
//  CIContext* context = [CIContext contextWithOptions:nil];
//  CGImageRef cgImage = [context createCGImage:ciImage
//                                     fromRect:[ciImage extent]];
//  UIImage* uiImage = [UIImage imageWithCGImage:cgImage];
//  CGImageRelease(cgImage);
//
//  CGSize newSize = CGSizeMake(uiImage.size.width, uiImage.size.height);
//  CGRect rect = CGRectMake(0, 0, newSize.width, newSize.height);
//
//  UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0);
//  [uiImage drawInRect:rect];
//
//  UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
//  UIGraphicsEndImageContext();
//
//  return newImage;
//}

NSMutableArray* parseSSDMobileNet2(float threshold, int num_results_per_class) {
  assert(interpreterl->outputs().size() == 4);
  
  NSMutableArray* results = [NSMutableArray array];
  float* output_locations = interpreterl->typed_output_tensor<float>(1);
  float* output_classes = interpreterl->typed_output_tensor<float>(3);
  float* output_scores = interpreterl->typed_output_tensor<float>(0);
  float* num_detections = interpreterl->typed_output_tensor<float>(2);
  
  NSMutableDictionary* counters = [NSMutableDictionary dictionary];
  for (int d = 0; d < *num_detections; d++)
  {
    const int detected_class = output_classes[d];
    float score = output_scores[d];
    
    if (score < threshold) continue;
    
    NSMutableDictionary* res = [NSMutableDictionary dictionary];
    //NSString* class_name = [NSString stringWithUTF8String:labels[detected_class + 1].c_str()];
    NSString* class_name = @"bl";
    NSObject* counter = [counters objectForKey:class_name];
    
    if (counter) {
      int countValue = [(NSNumber*)counter intValue] + 1;
      if (countValue > num_results_per_class) {
        continue;
      }
      [counters setObject:@(countValue) forKey:class_name];
    } else {
      [counters setObject:@(1) forKey:class_name];
    }
    
    [res setObject:@(score) forKey:@"confidenceInClass"];
    [res setObject:class_name forKey:@"detectedClass"];
    
    const float ymin = fmax(0, output_locations[d * 4]);
    const float xmin = fmax(0, output_locations[d * 4 + 1]);
    const float ymax = output_locations[d * 4 + 2];
    const float xmax = output_locations[d * 4 + 3];
    
    NSMutableDictionary* rect = [NSMutableDictionary dictionary];
    [rect setObject:@(xmin) forKey:@"x"];
    [rect setObject:@(ymin) forKey:@"y"];
    [rect setObject:@(fmin(1 - xmin, xmax - xmin)) forKey:@"w"];
    [rect setObject:@(fmin(1 - ymin, ymax - ymin)) forKey:@"h"];
    
    [res setObject:rect forKey:@"rect"];
    [results addObject:res];
  }
  return results;
}

//void feedInputTensorFrameLive(Frame* frame, float input_mean, float input_std, int* input_size) {
//  int image_channels;
//  int image_height;
//  int image_width;
//  std::vector<uint8_t> image_data = LoadImageFromFrame(frame, &image_width, &image_height, &image_channels);
//  uint8_t* in = image_data.data();
//  feedInputTensorLive(in, input_size, image_height, image_width, image_channels, input_mean, input_std);
//}



static inline id process_frame_plugi(Frame* frame, NSArray* args) {
  NSDictionary* config = [args objectAtIndex:0];
    UIImageOrientation orientation = frame.orientation;
  
  // run multi model
  
  NSString* model_file = config[@"model"];

    NSArray *splitFile = [model_file componentsSeparatedByString:@"."];
    NSString* graph_path = [[NSBundle mainBundle] pathForResource:splitFile[0] ofType:splitFile[1]];
    //NSString* graph_path = [[NSBundle mainBundle] pathForResource:model_file ofType:nil];
    modelLive = tflite::FlatBufferModel::BuildFromFile([graph_path UTF8String]);
    LOG(INFO) << "Loaded model " << graph_path;
    modelLive->error_reporter();
    LOG(INFO) << "resolved reporter";
    
    if (!modelLive) {
      //callback(@[[NSString stringWithFormat:@"%s %@", "Failed to mmap model", model_file]]);
    }
    
//    NSString* labels_path = [[NSBundle mainBundle] pathForResource:labels_file ofType:nil];
//    if ([labels_path length] > 0) {
//      LoadLabels(labels_path, &labels);
//    }
    
    tflite::ops::builtin::BuiltinOpResolver resolver;
    tflite::InterpreterBuilder(*modelLive, resolver)(&interpreterl);
    if (!interpreterl) {
      //callback(@[@"Failed to construct interpreter"]);
    }
    
    if (interpreterl->AllocateTensors() != kTfLiteOk) {
      //callback(@[@"Failed to allocate tensors!"]);
    }
    

    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer);
   // size_t width = CVPixelBufferGetWidth(imageBuffer);
   // size_t height = CVPixelBufferGetHeight(imageBuffer);

    NSError* error;
//    TFLDetectionResult* detectionResult = [[LiveObjectDetectionProcessPlugin
//        detector:config] detectWithGMLImage:gmlImage error:&error];
  
  if (!interpreterl) {
      NSLog(@"Failed to construct interpreter.");
    }
    
    int input_size;
    //feedInputTensorFrameLive(frame, 127.5, 127.5, &input_size);
    
    if (interpreterl->Invoke() != kTfLiteOk) {
      NSLog(@"Failed to invoke!");
    }
  NSMutableArray* results = parseSSDMobileNet2(127.0, 10);
    
  return results;
}

//VISION_EXPORT_FRAME_PROCESSOR(process_frame_plugi)

@end
