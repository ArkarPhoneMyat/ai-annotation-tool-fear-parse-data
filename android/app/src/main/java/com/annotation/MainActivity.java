package com.annotation;

import android.content.Context;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Environment;
import android.util.Log;

import java.io.File;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "annotation";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    this.sendBroadcast(intent);
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView
   * is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or
   * the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    // return new MainActivityDelegate(this, getMainComponentName());
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabric
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
    );
  }

  // public static class MainActivityDelegate extends ReactActivityDelegate {
  // public MainActivityDelegate(ReactActivity activity, String mainComponentName)
  // {
  // super(activity, mainComponentName);
  // }

  // @Override
  // protected void onCreate(Bundle savedInstanceState) {
  // super.onCreate(null);
  // // deleteCache(getContext());
  // }

  // @Override
  // protected ReactRootView createRootView() {
  // ReactRootView reactRootView = new ReactRootView(getContext());
  // // If you opted-in for the New Architecture, we enable the Fabric Renderer.
  // reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
  // return reactRootView;
  // }

  // @Override
  // protected boolean isConcurrentRootEnabled() {
  // // If you opted-in for the New Architecture, we enable Concurrent Root (i.e.
  // // React 18).
  // // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
  // return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
  // }

  // public static void deleteCache(Context context) {
  // try {
  // File dir = context.getCacheDir();
  // File dirFi = context.getFilesDir();
  // // Log.d("cah", "deleteCache: ",dirFi.delete());
  // deleteDir(dir);

  // } catch (Exception e) {
  // }
  // }

  // private void deleteTempFolder(String dir) {
  // File myDir = new File(Environment.getExternalStorageDirectory() + "/" + dir);
  // if (myDir.isDirectory()) {
  // String[] children = myDir.list();
  // for (int i = 0; i < children.length; i++) {
  // new File(myDir, children[i]).delete();
  // }
  // }
  // }

  // public static boolean deleteDir(File dir) {
  // if (dir != null && dir.isDirectory()) {
  // String[] children = dir.list();
  // for (int i = 0; i < children.length; i++) {
  // boolean success = deleteDir(new File(dir, children[i]));
  // if (!success) {
  // return false;
  // }
  // }
  // return dir.delete();
  // } else if (dir != null && dir.isFile()) {
  // return dir.delete();
  // } else {
  // return false;
  // }
  // }
  // }
}
