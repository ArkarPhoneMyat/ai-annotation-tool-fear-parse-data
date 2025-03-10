////
////  ImageHelpers.m
////  annotation
////
////  Created by Macintosh on 7/2/23.
////
//
//#include "ImageHelperss.h"
//
//#define AdvancePtr( _ptr, _bytes) (__typeof__(_ptr))((uintptr_t)(_ptr) + (size_t)(_bytes))
//
//vImage_Buffer ImageHelperss::vImageCropBuffer(vImage_Buffer buf, CGRect where, size_t pixelBytes) {
//  return (vImage_Buffer) {
//    .data = AdvancePtr(buf.data, where.origin.y * buf.rowBytes + where.origin.x * pixelBytes),
//    .height = (unsigned long) where.size.height,
//    .width = (unsigned long) where.size.width,
//    .rowBytes = buf.rowBytes
//  };
//}
//
//CGImageRef ImageHelperss::convertImageBufferToCGImage(vImage_Buffer buffer) {
//  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
//  vImage_CGImageFormat format = {
//    .bitsPerComponent = 8,
//    .bitsPerPixel = 24,
//    .colorSpace = colorSpace,
//    .bitmapInfo = kCGImageByteOrderDefault | kCGImageAlphaNone,
//    .version = 0,
//    .decode = NULL,
//    .renderingIntent = kCGRenderingIntentDefault
//  };
//
//  CGImageRef image = vImageCreateCGImageFromBuffer(&buffer, &format, NULL, NULL, kvImageNoFlags, NULL);
//
//  CFRelease(colorSpace);
//  return image;
//}
