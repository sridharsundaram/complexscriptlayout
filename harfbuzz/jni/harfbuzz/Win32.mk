#
#############################################################
#   build the harfbuzz library
#

LOCAL_CFLAGS := -DHAVE_OT -O2 -DHB_NO_UNICODE_FUNCS -D__MINGW32__
LOCAL_PATH:=C:/Users/sridhar/git/complexscriptlayout/harfbuzz/jni/harfbuzz

LOCAL_SRC_FILES:= \
        src/hb-blob.cc \
        src/hb-buffer.cc \
        src/hb-common.cc \
        src/hb-fallback-shape.cc \
        src/hb-font.cc \
        src/hb-ft.cc \
        src/hb-ot-layout.cc \
        src/hb-ot-map.cc \
        src/hb-ot-shape.cc \
        src/hb-ot-shape-complex-arabic.cc \
        src/hb-ot-shape-complex-indic.cc \
        src/hb-ot-shape-complex-misc.cc \
        src/hb-ot-shape-fallback.cc \
        src/hb-ot-shape-normalize.cc \
        src/hb-ot-tag.cc \
        src/hb-set.cc \
        src/hb-shape.cc \
        src/hb-shaper.cc \
        src/hb-shape-plan.cc \
        src/hb-tt-font.cc \
        src/hb-unicode.cc

LOCAL_C_INCLUDES += \
        -I"$(LOCAL_PATH)/src" \
        -I"$(LOCAL_PATH)/../freetype/include"

LOCAL_MODULE:= harfbuzz


harfbuzz: $(LOCAL_SRC_FILES);
	gcc -c -m32 -msse2 $(LOCAL_CFLAGS) $(LOCAL_C_INCLUDES) $(LOCAL_SRC_FILES)
  
clean:
	-rm *.o
	  
LOCAL_STATIC_LIBRARIES:= ft2

include $(BUILD_STATIC_LIBRARY)
