//
//  load_image.m
//  annotation
//
//  Created by Macintosh on 6/29/23.
//

//
//  ios_image_load.m
//  annotation
//
//  Created by Philip on 6/22/23.
//

#include "ios_image_load.h"

#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdio.h>

#import <CoreImage/CoreImage.h>
#import <ImageIO/ImageIO.h>
#import <VisionCamera/Frame.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <Foundation/Foundation.h>
#import <TensorFlowLiteTaskVision/TensorFlowLiteTaskVision.h>

//@interface RealtimeObjectDetectionProcessorPlugin : NSObject
//+ (UIImage*)resizeFrameToUIimage:(Frame*)frame;
//@end

//@implementation RealtimeObjectDetectionProcessorPlugin
//
//+(UIImage*)resizeFrameToUIimage:(Frame*)frame {
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

std::vector<uint8_t> LoadImageFrom(Frame* frame,
                                        int* out_width, int* out_height,
                                        int* out_channels){
//  UIImage* resizedImageResult =[RealtimeObjectDetectionProcessorPlugin resizeFrameToUIimage:frame];
//  GMLImage* gmlImage = [[GMLImage alloc] initWithImage:resizedImageResult];
  CVImageBufferRef image = CMSampleBufferGetImageBuffer(frame.buffer);
  int width = (int)CVPixelBufferGetWidth(image);
  int height = (int)CVPixelBufferGetHeight(image);
  const int channels = 4;
  CGColorSpaceRef color_space = CGColorSpaceCreateDeviceRGB();
  const int bytes_per_row = (width * channels);
  const int bytes_in_image = (bytes_per_row * height);
  std::vector<uint8_t> result(bytes_in_image);
  const int bits_per_component = 8;
  
  CGContextRef context = CGBitmapContextCreate(result.data(), width, height,
                                               bits_per_component, bytes_per_row, color_space,
                                               kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(color_space);
  //CGContextDrawImage(context, CGRectMake(0, 0, width, height), image);
  CGContextRelease(context);
  CFRelease(image);
  //CFRelease(image_provider);
  //CFRelease(file_data_ref);
  
  *out_width = width;
  *out_height = height;
  *out_channels = channels;
  return result;
}

