LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=/Users/sridhar/git/complexscriptlayout/harfbuzz/jni
JAVA_HOME:="/Library/Java/JavaVirtualMachines/jdk1.7.0_40.jdk/Contents/Home/"

PLATFORM_SIM:="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk"
PLATFORM_MAC:="/Applications/XCode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSC10.10.sdk"
PLATFORM_IOS:="/Applications/XCode.app/Contents/Developer/Platforms/IPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk"

ARCH:=x64
ARCH:=thumbv7
ARCH:=arm64
LOCAL_C_INCLUDES = \
	-I"$(JAVA_HOME)/include" \
	-I"$(JAVA_HOME)/include/darwin" \
	-I"$(LOCAL_PATH)/harfbuzz/src" \
	-I"$(LOCAL_PATH)/freetype/include" \
	-I"$(PLATFORM_SIM)/usr/include" \
	-I"$(LOCAL_PATH)"
COMPILER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -ferror-limit=1000

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
	cd freetype; make -f Ios64.mk libft2; cd ..
	cd harfbuzz; make -f Ios64.mk harfbuzz; cd ..
	$(COMPILER) -Wall -m64 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at $(LOCAL_C_INCLUDES) android/log.c complex_script_layout.c
	$(COMPILER) -static -m64 -Wl -o complex_script_layout64.dll freetype/*.o harfbuzz/*.o log.o complex_script_layout.o
	zip complex_script_layout.jar complex_script_layout64.dll

clean:
	cd freetype; make -f Win64.mk clean; cd ..
	cd harfbuzz; make -f Win64.mk clean; cd ..
	-rm *.o
