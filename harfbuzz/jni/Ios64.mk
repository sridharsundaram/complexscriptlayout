LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=/Users/sridhar/git/complexscriptlayout/harfbuzz/jni
JAVA_HOME:="/Library/Java/JavaVirtualMachines/jdk1.7.0_40.jdk/Contents/Home/"

LOCAL_C_INCLUDES = \
	-I"$(JAVA_HOME)/include" \
	-I"$(JAVA_HOME)/include/darwin" \
	-I"$(LOCAL_PATH)/harfbuzz/src" \
	-I"$(LOCAL_PATH)/freetype/include" \
	-I"$(LOCAL_PATH)"
COMPILER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -ferror-limit=1000 -arch $(ARCH)
LINKER:=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ar
LOCAL_CFLAGS:=-Wall -c -fno-exceptions -D_JNI_IMPLEMENTATION_ -Wl,--kill-at 

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
#	cd freetype; make -f Ios64.mk libft2; cd ..
	cd harfbuzz; make -f Ios64.mk harfbuzz; cd ..
	$(COMPILER) $(LOCAL_CFLAGS) $(LOCAL_C_INCLUDES) -isysroot $(PLATFORM) complex_script_layout.c
	libtool -static -o libcomplex_script_layout.a harfbuzz/*.o *.o
#	$(LINKER) -rcs libcomplex_script_layout.a freetype/*.o harfbuzz/*.o *.o
#	$(COMPILER) -Wall -D_JNI_IMPLEMENTATION_ -Wl -v -isysroot $(PLATFORM) -o libcomplex_script_layout.a freetype/*.o harfbuzz/*.o complex_script_layout.o

clean:
	cd freetype; make -f Win64.mk clean; cd ..
	cd harfbuzz; make -f Win64.mk clean; cd ..
	-rm *.o
