#


LOCAL_STATIC_LIBRARIES := ft2 harfbuzz
LOCAL_PATH:=~/Documents/workspace/complexscriptlayout/harfbuzz/jni
LOCAL_C_INCLUDES = \
        -I"$(JAVA_HOME)/include" \
        -I"$(LOCAL_PATH)/harfbuzz/src" \
        -I"$(LOCAL_PATH)/freetype/include" \
        -I"$(LOCAL_PATH)

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
	cd freetype; make -f Win64.mk libft2; cd ..
	cd harfbuzz; make -f Win64.mk harfbuzz; cd ..
	gcc -Wall -m64 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at $(LOCAL_C_INCLUDES) android/log.c complex_script_layout.c
	g++ -static -m64 -Wl,-subsystem,windows -shared -o complex_script_layout64.dll freetype/*.o harfbuzz/*.o log.o complex_script_layout.o
	zip complex_script_layout.jar complex_script_layout64.dll

clean:
	cd freetype; make -f Win64.mk clean; cd ..
	cd harfbuzz; make -f Win64.mk clean; cd ..
	-rm *.o