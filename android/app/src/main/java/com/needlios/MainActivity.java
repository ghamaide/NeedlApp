package com.needlios;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.magus.fblogin.FacebookLoginPackage;

import com.AirMaps.AirPackage;

import com.rt2zz.reactnativecontacts.ReactNativeContacts;

import com.oblador.vectoricons.VectorIconsPackage;

import com.oney.gcm.GcmPackage;
import io.neson.react.notification.NotificationPackage;

import com.learnium.RNDeviceInfo.*;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "NeedlIOS";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

   /**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
        
        
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new AirPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new ReactNativeContacts(),
            new FacebookLoginPackage(),
            new GcmPackage(),
            new NotificationPackage(this)
        );
    }
}
