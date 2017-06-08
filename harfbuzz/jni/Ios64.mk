LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=/Users/sridhar/git/complexscriptlayout/harfbuzz/jni
JAVA_HOME:="/Library/Java/JavaVirtualMachines/jdk1.7.0_40.jdk/Contents/Home/"

PLATFORM_SIM:="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk"
PLATFORM_MAC:="/Applications/XCode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSC10.10.sdk"
PLATFORM_IOS:="/Applications/XCode.app/Contents/Developer/Platforms/IPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk"

ARCH:=armv7s
ARCH:=armv7
ARCH:=i386

ifeq ($(ARCH),i386)
  PLATFORM:=$(PLATFORM_SIM)
  sdk:=iPhoneSimulator
endif
ifeq ($(ARCH),armv7s)
  PLATFORM:=$(PLATFORM_IOS)
  sdk:=iPhoneOS
endif
ifeq ($(ARCH),armv7)
  PLATFORM:=$(PLATFORM_IOS)
  sdk:=iPhoneOS
endif

LOCAL_C_INCLUDES = \
	-I"$(JAVA_HOME)/include" \
	-I"$(JAVA_HOME)/include/darwin" \
	-I"$(LOCAL_PATH)/harfbuzz/src" \
	-I"$(LOCAL_PATH)/freetype/include" \
	-I"$(LOCAL_PATH)"
COMPILER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -ferror-limit=1000 -arch $(ARCH)
LINKER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++ -ferror-limit=1000 -arch $(ARCH)
LOCAL_CFLAGS:=-Wall -m64 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at -miphoneos-version-min=8.0

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
#	cd freetype; make -f Ios64.mk libft2; cd ..
#	cd harfbuzz; make -f Ios64.mk harfbuzz; cd ..
#	$(COMPILER) $(LOCAL_CFLAGS) $(LOCAL_C_INCLUDES) -isysroot $(PLATFORM) android/log.c complex_script_layout.c
	$(LINKER) -Wall -D_JNI_IMPLEMENTATION_ -Wl -v -shared -isysroot $(PLATFORM) -miphoneos-version-min=8.0 -o complex_script_layout.a freetype/*.o harfbuzz/*.o log.o complex_script_layout.o 
#-m64 -Wl	  

clean:
	cd freetype; make -f Win64.mk clean; cd ..
	cd harfbuzz; make -f Win64.mk clean; cd ..
	-rm *.o
