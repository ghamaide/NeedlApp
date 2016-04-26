package com.needlios;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.AirMaps.AirPackage;

import com.rt2zz.reactnativecontacts.ReactNativeContacts;

import com.oblador.vectoricons.VectorIconsPackage;

import com.oney.gcm.GcmPackage;
import io.neson.react.notification.NotificationPackage;

import com.learnium.RNDeviceInfo.*;

import com.kevinejohn.RNMixpanel.*;

import com.burnweb.rnsendintent.RNSendIntentPackage;

import android.content.Intent;
import com.dispatcher.rnbranch.*;

import com.BV.LinearGradient.LinearGradientPackage;

import com.imagepicker.ImagePickerPackage;

import android.os.Bundle;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    CallbackManager mCallbackManager;

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
        mCallbackManager = new CallbackManager.Factory().create();

        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new AirPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new ReactNativeContacts(),
            new GcmPackage(),
            new NotificationPackage(this),
            new RNMixpanel(),
            new RNSendIntentPackage(),
            new RNBranchPackage(),
            new LinearGradientPackage(),
            new ImagePickerPackage(),
            new FBSDKPackage(mCallbackManager)
        );
    }

    @Override
    public void onStart() {
        super.onStart();

        RNBranchModule.initSession(this.getIntent().getData(), this);
    }

    @Override
    public void onNewIntent(Intent intent) {
        this.setIntent(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FacebookSdk.sdkInitialize(getApplicationContext());
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
    }
}
