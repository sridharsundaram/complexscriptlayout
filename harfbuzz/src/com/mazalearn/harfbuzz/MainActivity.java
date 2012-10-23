
package com.mazalearn.harfbuzz;

import android.app.Activity;
import android.os.Bundle;

public class MainActivity extends Activity {
  
  public native int getGlyphsAferShaping(String unicodeText, int start,
      int end, Boolean lock);
  
  static {
    System.loadLibrary("complex-script-rendering");
  }
  
  /** Called when the activity is first created. */
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getGlyphsAferShaping("test", 0, 4, new Boolean(false));
  }

}
