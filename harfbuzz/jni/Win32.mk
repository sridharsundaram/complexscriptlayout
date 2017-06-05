#


LOCAL_STATIC_LIBRARIES := ft2 harfbuzz

complex_script_layout: complex_script_layout.c
	@rm -f complex_script_layout.dll
	cd freetype; make -f Win32.mk libft2; cd ..
	cd harfbuzz; make -f Win32.mk harfbuzz; cd ..
	gcc -Wall -m32 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at -I"C:/Program Files/Java/jdk1.8.0_111/include" -I"C:/Program Files/Java/jdk1.8.0_111/include/win32" \
   -I"c:/Users/Sridhar/git/complexscriptlayout/harfbuzz/jni/harfbuzz/src" -I"c:/users/sridhar/git/complexscriptlayout/harfbuzz/jni/freetype/include"  -I"C:/users/sridhar/git/complexscriptlayout/harfbuzz/jni" android/log.c  complex_script_layout_win.c
	g++ -static -m32 -Wl,-subsystem,windows -shared -o complex_script_layout32.dll freetype/*.o harfbuzz/*.o log.o complex_script_layout_win.o
	zip complex_script_layout.jar complex_script_layout32.dll
