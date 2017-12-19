package com.badlogic.gdx.graphics.g2d;

/*******************************************************************************
 * Copyright 2017 Maza Learn
 ******************************************************************************/

import com.badlogic.gdx.jnigen.AntScriptGenerator;
import com.badlogic.gdx.jnigen.BuildConfig;
import com.badlogic.gdx.jnigen.BuildExecutor;
import com.badlogic.gdx.jnigen.BuildTarget;
import com.badlogic.gdx.jnigen.BuildTarget.TargetOs;
import com.badlogic.gdx.jnigen.NativeCodeGenerator;

public class ComplexScriptLayoutBuild {
	public static void main (String[] args) throws Exception {
		String[] headers = {"jni/freetype/include","jni/freetype/builds", "jni/harfbuzz/src"};
		String[] sources = {
			// FREETYPE
				"jni/freetype/src/base/ftbbox.c",
				"jni/freetype/src/base/ftbitmap.c",
				"jni/freetype/src/base/ftfstype.c",
				"jni/freetype/src/base/ftglyph.c",
				"jni/freetype/src/base/ftlcdfil.c",
				"jni/freetype/src/base/ftstroke.c",
				"jni/freetype/src/base/fttype1.c",
				"jni/freetype/src/base/ftxf86.c",
				"jni/freetype/src/base/ftbase.c",
				"jni/freetype/src/base/ftsystem.c",
				"jni/freetype/src/base/ftinit.c",
				"jni/freetype/src/base/ftgasp.c",
				"jni/freetype/src/raster/raster.c",
				"jni/freetype/src/sfnt/sfnt.c",
				"jni/freetype/src/smooth/smooth.c",
				"jni/freetype/src/autofit/autofit.c",
				"jni/freetype/src/truetype/truetype.c",
				"jni/freetype/src/cff/cff.c",
				"jni/freetype/src/psnames/psnames.c",
				"jni/freetype/src/pshinter/pshinter.c",

			// HARFBUZZ
        "jni/harfbuzz/src/hb-blob.cc",
        "jni/harfbuzz/src/hb-buffer.cc",
        "jni/harfbuzz/src/hb-common.cc",
        "jni/harfbuzz/src/hb-fallback-shape.cc",
        "jni/harfbuzz/src/hb-font.cc",
        "jni/harfbuzz/src/hb-ft.cc",
        "jni/harfbuzz/src/hb-ot-layout.cc",
        "jni/harfbuzz/src/hb-ot-map.cc",
        "jni/harfbuzz/src/hb-ot-shape.cc",
        "jni/harfbuzz/src/hb-ot-shape-complex-arabic.cc",
        "jni/harfbuzz/src/hb-ot-shape-complex-indic.cc",
        "jni/harfbuzz/src/hb-ot-shape-complex-misc.cc",
        "jni/harfbuzz/src/hb-ot-shape-fallback.cc",
        "jni/harfbuzz/src/hb-ot-shape-normalize.cc",
        "jni/harfbuzz/src/hb-ot-tag.cc",
        "jni/harfbuzz/src/hb-set.cc",
        "jni/harfbuzz/src/hb-shape.cc",
        "jni/harfbuzz/src/hb-shaper.cc",
        "jni/harfbuzz/src/hb-shape-plan.cc",
        "jni/harfbuzz/src/hb-tt-font.cc",
        "jni/harfbuzz/src/hb-unicode.cc",

			// MAIN
        "jni/android/log.c",
        "jni/complex_script_layout.c"
    };
/*
		BuildTarget win32home = BuildTarget.newDefaultTarget(TargetOs.Windows, false);
		win32home.compilerPrefix = "";
		win32home.buildFileName = "build-windows32home.xml";
		win32home.excludeFromMasterBuildFile = true;
		win32home.headerDirs = headers;
		win32home.cIncludes = sources;
		win32home.cFlags += " -W -Wall -DPIC -DFT2_BUILD_LIBRARY -O2";
		win32home.cppFlags += "  -DFT2_BUILD_LIBRARY";

		BuildTarget win32 = BuildTarget.newDefaultTarget(TargetOs.Windows, false);
		win32.headerDirs = headers;
		win32.cIncludes = sources;
		win32.cFlags += "  -DFT2_BUILD_LIBRARY";
		win32.cppFlags += "  -DFT2_BUILD_LIBRARY";
*/
		BuildTarget win64 = BuildTarget.newDefaultTarget(TargetOs.Windows, true);
		win64.headerDirs = headers;
		win64.cIncludes = sources;
		win64.cFlags += " -W -Wall -DPIC -DFT2_BUILD_LIBRARY -O2";
		win64.cppFlags += "  -DFT2_BUILD_LIBRARY";
/*
		BuildTarget lin32 = BuildTarget.newDefaultTarget(TargetOs.Linux, false);
		lin32.headerDirs = headers;
		lin32.cIncludes = sources;
		lin32.cFlags += "  -DFT2_BUILD_LIBRARY";
		lin32.cppFlags += "  -DFT2_BUILD_LIBRARY";

		BuildTarget lin64 = BuildTarget.newDefaultTarget(TargetOs.Linux, true);
		lin64.headerDirs = headers;
		lin64.cIncludes = sources;
		lin64.cFlags += "  -DFT2_BUILD_LIBRARY";
		lin64.cppFlags += "  -DFT2_BUILD_LIBRARY";

		BuildTarget mac = BuildTarget.newDefaultTarget(TargetOs.MacOsX, false);
		mac.headerDirs = headers;
		mac.cIncludes = sources;
		mac.cFlags += " -DFT2_BUILD_LIBRARY";
		mac.cppFlags += " -DFT2_BUILD_LIBRARY";
		mac.linkerFlags += " -framework CoreServices -framework Carbon";
		
		BuildTarget mac64 = BuildTarget.newDefaultTarget(TargetOs.MacOsX, true);
		mac64.headerDirs = headers;
		mac64.cIncludes = sources;
		mac64.cFlags += " -DFT2_BUILD_LIBRARY";
		mac64.cppFlags += " -DFT2_BUILD_LIBRARY";
		mac64.linkerFlags += " -framework CoreServices -framework Carbon";

		BuildTarget android = BuildTarget.newDefaultTarget(TargetOs.Android, false);
		android.headerDirs = headers;
		android.cIncludes = sources;
		android.cFlags += "  -DFT2_BUILD_LIBRARY";
		android.cppFlags += "  -DFT2_BUILD_LIBRARY";

		BuildTarget ios = BuildTarget.newDefaultTarget(TargetOs.IOS, false);
		ios.headerDirs = headers;
		ios.cIncludes = sources;
		ios.cFlags += " -DFT2_BUILD_LIBRARY";
		ios.cppFlags += " -DFT2_BUILD_LIBRARY";
*/
		new NativeCodeGenerator().generate("", "bin:../../gdx/bin", "jni");
		new AntScriptGenerator()
		  .generate(new BuildConfig("gdx-freetype"), win64);
//			.generate(new BuildConfig("gdx-freetype"), win32home, win32, win64, lin32, lin64, mac, mac64, android, ios);

		// BuildExecutor.executeAnt("jni/build-windows32home.xml", "-v clean");
// BuildExecutor.executeAnt("jni/build-windows32home.xml", "-v");
// BuildExecutor.executeAnt("jni/build.xml", "pack-natives -v");
	}
}