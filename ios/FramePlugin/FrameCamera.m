//
//  FrameCamera.m
//  annotation
//
//  Created by Macintosh on 7/6/23.
//
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FrameCamera, NSObject)

RCT_EXTERN_METHOD(useCustomModel:(NSDictionary *)customModelConfig
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
