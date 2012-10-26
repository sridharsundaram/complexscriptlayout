#
# Copyright © 2012 Shiva Kumar H R
# 
# Permission is hereby granted, free of charge, to any person obtaining a 
# copy of this software and associated documentation files (the "Software"), 
# to deal in the Software without restriction, including without limitation 
# the rights to use, copy, modify, merge, publish, distribute, sublicense, 
# and/or sell copies of the Software, and to permit persons to whom the 
# Software is furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included 
# in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# Set NDK_MODULE_PATH so that freetype module is accessible.
# set NDK_MODULE_PATH=c:\users\sridhar\git\harfbuzz\harfbuzz
# Run NDK from Windows command line
# C:\Users\sridhar\android-ndk-r7b\ndk-build.cmd NDK_DEBUG=1 NDK_LOG=1

LOCAL_PATH := $(call my-dir)

MY_LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

NDK_MODULE_PATH := $(LOCAL_PATH)/..

MY_LIB_PATH := $(LOCAL_PATH)/../freetype/$(TARGET_ARCH_ABI)

LOCAL_ARM_MODE := arm

LOCAL_MODULE := complex_script_layout

LOCAL_C_INCLUDES := $(LOCAL_PATH)/harfbuzz/src

LOCAL_SRC_FILES := complex_script_layout.c

LOCAL_STATIC_LIBRARIES := harfbuzz

LOCAL_LDLIBS := -llog

LOCAL_LDLIBS += $(MY_LIB_PATH)/libgdx-freetype.so

LOCAL_SHARED_LIBRARIES := freetype

include $(BUILD_SHARED_LIBRARY)

include $(MY_LOCAL_PATH)/harfbuzz/Android.mk

$(call import-add-path,$(LOCAL_PATH)/..)

$(call import-module,freetype)