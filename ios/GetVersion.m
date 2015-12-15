//
//  GetVersion.m
//  NeedlIOS
//
//  Created by Gregoire Hamaide on 12/15/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@implementation GetVersion : NSObject

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport
{
  NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  return @{ @"version": version };
}

@end
