#


LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=C:/Users/Sridhar/git/complexscriptlayout/harfbuzz/jni
JAVA_HOME:="C:/Program\ Files/Java/jdk1.8.0_111"
LOCAL_C_INCLUDES = \
        -I"$(JAVA_HOME)/include" \
        -I"$(JAVA_HOME)/include/win32" \
        -I"$(LOCAL_PATH)/harfbuzz/src" \
        -I"$(LOCAL_PATH)/freetype/include" \
        -I"$(LOCAL_PATH)"

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
	cd freetype; make -f Win32.mk libft2; cd ..
	cd harfbuzz; make -f Win32.mk harfbuzz; cd ..
	gcc -Wall -m32 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at $(LOCAL_C_INCLUDES) android/log.c complex_script_layout.c
	g++ -static -m32 -Wl,-subsystem,windows -shared -o complex_script_layout32.dll freetype/*.o harfbuzz/*.o log.o complex_script_layout.o
	zip complex_script_layout.jar complex_script_layout32.dll
