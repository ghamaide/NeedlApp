NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];

  NSDictionary *props = @{@"version" : version};

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"NeedlIOS"
                                               initialProperties:props
                                                   launchOptions:launchOptions];
  