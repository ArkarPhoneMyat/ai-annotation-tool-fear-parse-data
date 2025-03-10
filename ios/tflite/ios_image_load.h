//
//  ios_image_load.h
//  annotation
//
//  Created by Philip on 6/22/23.
//

#include <vector>
#import <VisionCamera/Frame.h>

std::vector<uint8_t> LoadImageFromFile(const char* file_name,
             int* out_width,
             int* out_height,
             int* out_channels);

std::vector<uint8_t> LoadFrame(Frame* frame,
             int* out_width,
             int* out_height,
             int* out_channels);

std::vector<uint8_t> cGImageToPixels(CGImage* frame,
             int* out_width,
             int* out_height,
             int* out_channels);


