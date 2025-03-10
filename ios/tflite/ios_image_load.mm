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
#import "FrameResizerr.h"
#import "ImageHelperss.h"
#import <Accelerate/Accelerate.h>
#define AdvancePtr( _ptr, _bytes) (__typeof__(_ptr))((uintptr_t)(_ptr) + (size_t)(_bytes))
#define clamp(a) (a>255?255:(a<0?0:a))


//@interface RealtimeObjectDetectionProcessorPlugin : NSObject
//+ (UIImage*)resizeFrameToUIimage:(Frame*)frame;
//@end
std::vector<uint8_t> LoadImageFromFile(const char* file_name,
                                       int* out_width, int* out_height,
                                       int* out_channels) {
  FILE* file_handle = fopen(file_name, "rb");
  fseek(file_handle, 0, SEEK_END);
  const size_t bytes_in_file = ftell(file_handle);
  fseek(file_handle, 0, SEEK_SET);
  std::vector<uint8_t> file_data(bytes_in_file);
  fread(file_data.data(), 1, bytes_in_file, file_handle);
  fclose(file_handle);
  
  CFDataRef file_data_ref = CFDataCreateWithBytesNoCopy(NULL, file_data.data(),
                                                        bytes_in_file,
                                                        kCFAllocatorNull);
  CGDataProviderRef image_provider = CGDataProviderCreateWithCFData(file_data_ref);
  
  const char* suffix = strrchr(file_name, '.');
  if (!suffix || suffix == file_name) {
    suffix = "";
  }
  CGImageRef image;
  if (strcasecmp(suffix, ".png") == 0) {
    image = CGImageCreateWithPNGDataProvider(image_provider, NULL, true,
                                             kCGRenderingIntentDefault);
  } else if ((strcasecmp(suffix, ".jpg") == 0) ||
             (strcasecmp(suffix, ".jpeg") == 0)) {
    image = CGImageCreateWithJPEGDataProvider(image_provider, NULL, true,
                                              kCGRenderingIntentDefault);
  } else {
    CFRelease(image_provider);
    CFRelease(file_data_ref);
    fprintf(stderr, "Unknown suffix for file '%s'\n", file_name);
    out_width = 0;
    out_height = 0;
    *out_channels = 0;
    return std::vector<uint8_t>();
  }
  
  int width = (int)CGImageGetWidth(image);
  int height = (int)CGImageGetHeight(image);
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
  CGContextDrawImage(context, CGRectMake(0, 0, width, height), image);
  CGContextRelease(context);
  CFRelease(image);
  CFRelease(image_provider);
  CFRelease(file_data_ref);
  
  *out_width = width;
  *out_height = height;
  *out_channels = channels;
  return result;
}



CGImageRef imageFromSampleBuffer(CVPixelBufferRef imageBuffer)
{
    //CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    CVPixelBufferLockBaseAddress(imageBuffer,0);
    void *baseAddress = CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);
  
   // NSLog(@"hihhhhh", height, width);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();

    CGContextRef newContext = CGBitmapContextCreate(baseAddress, width, height, 8, 4 * width, colorSpace, kCGBitmapByteOrder32Big | kCGImageAlphaNoneSkipLast);
    CGImageRef newImage = CGBitmapContextCreateImage(newContext);
//  if (newContext == NULL) {
//        return nil;
//    }
  //0x0
  //CGBitmapInfo bitmapInfo = CGImageGetBitmapInfo(newImage);
    CGContextRelease(newContext);

    CGColorSpaceRelease(colorSpace);
  CGContextDrawImage(newContext, CGRectMake(0, 0, width, height), newImage);
    CVPixelBufferUnlockBaseAddress(imageBuffer,0);
  

    return newImage;
}

void assertCropAndScaleValid(CVPixelBufferRef pixelBuffer, CGRect cropRect, CGSize scaleSize) {
    CGFloat originalWidth = (CGFloat)CVPixelBufferGetWidth(pixelBuffer);
    CGFloat originalHeight = (CGFloat)CVPixelBufferGetHeight(pixelBuffer);

    assert(CGRectContainsRect(CGRectMake(0, 0, originalWidth, originalHeight), cropRect));
    assert(scaleSize.width > 0 && scaleSize.height > 0);
}
void pixelBufferReleaseCallBack(void *releaseRefCon, const void *baseAddress) {
    if (baseAddress != NULL) {
        free((void *)baseAddress);
    }
}
CVPixelBufferRef createCroppedPixelBuffer(CVPixelBufferRef sourcePixelBuffer, CGRect croppingRect, CGSize scaledSize) {

    OSType inputPixelFormat = CVPixelBufferGetPixelFormatType(sourcePixelBuffer);
    assert(inputPixelFormat == kCVPixelFormatType_32BGRA
           || inputPixelFormat == kCVPixelFormatType_32ABGR
           || inputPixelFormat == kCVPixelFormatType_32ARGB
           || inputPixelFormat == kCVPixelFormatType_32RGBA);

    assertCropAndScaleValid(sourcePixelBuffer, croppingRect, scaledSize);

    if (CVPixelBufferLockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly) != kCVReturnSuccess) {
        NSLog(@"Could not lock base address");
        return nil;
    }

    void *sourceData = CVPixelBufferGetBaseAddress(sourcePixelBuffer);
    if (sourceData == NULL) {
        NSLog(@"Error: could not get pixel buffer base address");
        CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
        return nil;
    }

    size_t sourceBytesPerRow = CVPixelBufferGetBytesPerRow(sourcePixelBuffer);
    size_t offset = CGRectGetMinY(croppingRect) * sourceBytesPerRow + CGRectGetMinX(croppingRect) * 4;

    vImage_Buffer croppedvImageBuffer = {
        .data = ((char *)sourceData) + offset,
        .height = (vImagePixelCount)CGRectGetHeight(croppingRect),
        .width = (vImagePixelCount)CGRectGetWidth(croppingRect),
        .rowBytes = sourceBytesPerRow
    };

    size_t scaledBytesPerRow = scaledSize.width * 4;
    void *scaledData = malloc(scaledSize.height * scaledBytesPerRow);
    if (scaledData == NULL) {
        NSLog(@"Error: out of memory");
        CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);
        return nil;
    }

    vImage_Buffer scaledvImageBuffer = {
        .data = scaledData,
        .height = (vImagePixelCount)scaledSize.height,
        .width = (vImagePixelCount)scaledSize.width,
        .rowBytes = scaledBytesPerRow
    };

    /* The ARGB8888, ARGB16U, ARGB16S and ARGBFFFF functions work equally well on
     * other channel orderings of 4-channel images, such as RGBA or BGRA.*/
    vImage_Error error = vImageScale_ARGB8888(&croppedvImageBuffer, &scaledvImageBuffer, nil, 0);
    CVPixelBufferUnlockBaseAddress(sourcePixelBuffer, kCVPixelBufferLock_ReadOnly);

    if (error != kvImageNoError) {
        NSLog(@"Error: %ld", error);
        free(scaledData);
        return nil;
    }

    OSType pixelFormat = CVPixelBufferGetPixelFormatType(sourcePixelBuffer);
    CVPixelBufferRef outputPixelBuffer = NULL;
    CVReturn status = CVPixelBufferCreateWithBytes(nil, scaledSize.width, scaledSize.height, pixelFormat, scaledData, scaledBytesPerRow, pixelBufferReleaseCallBack, nil, nil, &outputPixelBuffer);

    if (status != kCVReturnSuccess) {
        NSLog(@"Error: could not create new pixel buffer");
        free(scaledData);
        return nil;
    }

    return outputPixelBuffer;
}
CGImageRef imageFromSample(CMSampleBufferRef sampleBuffer) // Create a CGImageRef from sample buffer data
{
    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    CVPixelBufferLockBaseAddress(imageBuffer,0);        // Lock the image buffer

    uint8_t *baseAddress = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0);   // Get information of the image
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();

    CGContextRef newContext = CGBitmapContextCreate(baseAddress, width, height, 8, bytesPerRow, colorSpace, kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedFirst);
    CGImageRef newImage = CGBitmapContextCreateImage(newContext);
    CGContextRelease(newContext);

    CGColorSpaceRelease(colorSpace);
    CVPixelBufferUnlockBaseAddress(imageBuffer,0);
    /* CVBufferRelease(imageBuffer); */  // do not call this!

    return newImage;
}
std::vector<uint8_t> LoadFrame(Frame* frame,
                                        int* out_width, int* out_height,
                                       int* out_channels) {
  CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer);
      CVPixelBufferLockBaseAddress(imageBuffer, 0);
//
//  void *baseAddress = CVPixelBufferGetBaseAddress(imageBuffer);
 // size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
  size_t width = CVPixelBufferGetWidth(imageBuffer);
  size_t height = CVPixelBufferGetHeight(imageBuffer);
//
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
//
//  CGContextRef newContext = CGBitmapContextCreate(baseAddress, width, height, 8, 4 * width, colorSpace, kCGBitmapByteOrder32Big | kCGImageAlphaNoneSkipLast);

  CGImageRef newImage = imageFromSample(frame.buffer);
  const int channels = 4;
  const int bytes_per_row = (width * channels);
  const int bytes_in_image = (bytes_per_row * height);
  std::vector<uint8_t> result(bytes_in_image);


  
  CGContextRef context1 = CGBitmapContextCreate(result.data(), width, height,
                                               8, bytes_per_row, colorSpace,
                                               kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(colorSpace);
  CGContextDrawImage(context1, CGRectMake(0, 0, width, height), newImage);
  //CGContextRelease(newContext);
  CGContextRelease(context1);
  CFRelease(newImage);
  CVPixelBufferUnlockBaseAddress(imageBuffer, 0);



  *out_width = width;
  *out_height = height;
  *out_channels = channels;
  return result;
  //return nil;
}

std::vector<uint8_t> cGImageToPixels(CGImage* image,int* out_width, int* out_height,
                                     int* out_channels) {
  int width = (int)CGImageGetWidth(image);
  int height = (int)CGImageGetHeight(image);
  int channels = 4;
  
  CGColorSpaceRef color_space = CGColorSpaceCreateDeviceRGB();
  const int bytes_per_row = (width * channels);
  const int bytes_in_image = (bytes_per_row * height);
  std::vector<uint8_t> result(bytes_in_image);
  const int bits_per_component = 8;
  
  CGContextRef context =
  CGBitmapContextCreate(result.data(),width, height, bits_per_component, bytes_per_row,
                          color_space, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(color_space);
  CGContextDrawImage(context, CGRectMake(0, 0, width, height), image);
  CGContextRelease(context);
  CFRelease(image);
  
  *out_width = width;
  *out_height = height;
  *out_channels = channels;
  
  return result;
}



