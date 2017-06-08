# this is now the default FreeType build for Android
#
ifndef USE_FREETYPE
USE_FREETYPE := 2.4.2
endif

LOCAL_PATH:=~/Documents/workspace/complexscriptlayout/harfbuzz/jni/freetype

ifeq ($(USE_FREETYPE),2.4.2)
#LOCAL_PATH:= $(call my-dir)
include $(CLEAR_VARS)

LOCAL_SRC_FILES:= \
	src/base/ftbbox.c \
	src/base/ftbitmap.c \
	src/base/ftfstype.c \
	src/base/ftglyph.c \
	src/base/ftlcdfil.c \
	src/base/ftstroke.c \
	src/base/fttype1.c \
	src/base/ftxf86.c \
	src/base/ftbase.c \
	src/base/ftsystem.c \
	src/base/ftinit.c \
	src/base/ftgasp.c \
	src/raster/raster.c \
	src/sfnt/sfnt.c \
	src/smooth/smooth.c \
	src/autofit/autofit.c \
	src/truetype/truetype.c \
	src/cff/cff.c \
	src/psnames/psnames.c \
	src/pshinter/pshinter.c

LOCAL_C_INCLUDES += \
	-I"$(LOCAL_PATH)/builds" \
	-I"$(LOCAL_PATH)/include"

LOCAL_CFLAGS += -W -Wall
LOCAL_CFLAGS += -DPIC
#LOCAL_CFLAGS += "-DDARWIN_NO_CARBON"
LOCAL_CFLAGS += "-DFT2_BUILD_LIBRARY"

# the following is for testing only, and should not be used in final builds
# of the product
#LOCAL_CFLAGS += "-DTT_CONFIG_OPTION_BYTECODE_INTERPRETER"

LOCAL_CFLAGS += -O2

clean:
	-rm src/base/*.o
	-rm src/raster/*.o
	-rm src/smooth/*.o
	-rm src/autofit/*.o
	-rm src/truetype/*.o
	-rm src/cff/*.o
	-rm src/psnames/*.o
	-rm src/pshinter/*.o
	-rm *.o
	
libft2: $(LOCAL_SRC_FILES);
	gcc -c -m64 $(LOCAL_CFLAGS) $(LOCAL_C_INCLUDES) $(LOCAL_SRC_FILES)

include $(BUILD_STATIC_LIBRARY)
endif
