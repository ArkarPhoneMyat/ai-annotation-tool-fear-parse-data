//
//  load_image.h
//  annotation
//
//  Created by Macintosh on 6/29/23.
//

#include <vector>
#import <VisionCamera/Frame.h>

std::vector<uint8_t> LoadImageFrom(Frame* frame,
             int* out_width,
             int* out_height,
             int* out_channels);
