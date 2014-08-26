#


LOCAL_STATIC_LIBRARIES := ft2 harfbuzz

complex_script_layout: complex_script_layout_win.c
	@rm -f complex_script_layout.dll
	cd freetype; make -f Win.mk libft2; cd ..
	cd harfbuzz; make -f Win.mk harfbuzz; cd ..
	gcc -Wall -m64 -c -D_JNI_IMPLEMENTATION_ -Wl,--kill-at -I"C:/Program Files/Java/jdk1.8.0_11/include" -I"C:/Program Files/Java/jdk1.8.0_11/include/win32" \
   -I"E:/Users/Sridhar/git/harfbuzz/harfbuzz/jni/harfbuzz/src" -I"E:/users/sridhar/git/harfbuzz/harfbuzz/jni/freetype/include"  complex_script_layout_win.c
	g++ -m64 -Wl,-subsystem,windows -shared -o complex_script_layout64.dll freetype/*.o harfbuzz/*.o complex_script_layout_win.o
	zip complex_script_layout.jar complex_script_layout64.dll
