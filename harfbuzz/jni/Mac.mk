LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=/Users/sridhar/git/complexscriptlayout/harfbuzz/jni
JAVA_HOME:="/Library/Java/JavaVirtualMachines/jdk1.7.0_40.jdk/Contents/Home/"

PLATFORM_SIM:="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk"
PLATFORM_MAC:="/Applications/XCode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.12.sdk"
PLATFORM_IOS:="/Applications/XCode.app/Contents/Developer/Platforms/IPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk"

ARCH:=armv7s
ARCH:=armv7
ARCH:=i386
ARCH:=x86_64

ifeq ($(ARCH),i386)
  PLATFORM:=$(PLATFORM_SIM) -miphoneos-version-min=8.0
  sdk:=iPhoneSimulator
endif
ifeq ($(ARCH),armv7s)
  PLATFORM:=$(PLATFORM_IOS) -miphoneos-version-min=8.0
  sdk:=iPhoneOS
endif
ifeq ($(ARCH),armv7)
  PLATFORM:=$(PLATFORM_IOS) -miphoneos-version-min=8.0
  sdk:=iPhoneOS
endif
ifeq ($(ARCH),i386)
  PLATFORM:=$(PLATFORM_SIM) -miphoneos-version-min=8.0
  sdk:=iPhoneSimulator
endif
ifeq ($(ARCH),x86_64)
  PLATFORM:= $(PLATFORM_MAC)
  sdk:=MacOSX
endif

LOCAL_C_INCLUDES = \
	-I"$(JAVA_HOME)/include" \
	-I"$(JAVA_HOME)/include/darwin" \
	-I"$(LOCAL_PATH)/harfbuzz/src" \
	-I"$(LOCAL_PATH)/freetype/include" \
	-I"$(LOCAL_PATH)"
COMPILER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -ferror-limit=1000 -arch $(ARCH)
LINKER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++ -ferror-limit=1000 -arch $(ARCH)
LOCAL_CFLAGS:=-Wall -m64 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at 
#LIPO=$(xcrun -sdk MacOSX -find lipo)
complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
#	cd freetype; make -f Ios64.mk libft2; cd ..
#	cd harfbuzz; make -f Ios64.mk harfbuzz; cd ..
	$(COMPILER) $(LOCAL_CFLAGS) $(LOCAL_C_INCLUDES) -isysroot $(PLATFORM) android/log.c complex_script_layout.c
#	echo $(LIPO)
#	$(LIPO) -create complex_script_layout.a freetype/*.o harfbuzz/*.o *.o 
	libtool -macosx_version_min 10.12 -dynamic -o libcomplex_script_layout64.dylib freetype/*.o harfbuzz/*.o *.o -lc -lc++
	zip complex_script_layout.jar libcomplex_script_layout64.dylib
#	$(LINKER) -static -Wall -D_JNI_IMPLEMENTATION_ -Wl -v -isysroot $(PLATFORM) -o complex_script_layout.a freetype/*.o harfbuzz/*.o log.o complex_script_layout.o -lc -lc++

clean:
	cd freetype; make -f Win64.mk clean; cd ..
	cd harfbuzz; make -f Win64.mk clean; cd ..
	-rm *.o
