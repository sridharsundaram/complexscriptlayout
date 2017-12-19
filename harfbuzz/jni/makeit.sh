#!/bin/sh

#ARCH=i386
#ARCH=armv7s
#ARCH=armv7
#ARCH=x86_64
for ARCH in i386 x86_64
do
  export ARCH
  echo $ARCH
  
  if [ $ARCH == i386 ]
  then
    PLATFORM="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk -miphoneos-version-min=8.0"
    sdk=iPhoneSimulator
  elif [ $ARCH == armv7s ]
  then
    PLATFORM="/Applications/XCode.app/Contents/Developer/Platforms/IPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk -miphoneos-version-min=8.0"
    sdk=iPhoneOS
  elif [ $ARCH == armv7 ]
  then
    PLATFORM="/Applications/XCode.app/Contents/Developer/Platforms/IPhoneOS.platform/Developer/SDKs/iPhoneOS.sdk -miphoneos-version-min=8.0"
    sdk=iPhoneOS
  elif [ $ARCH == x86_64 ]
  then
    PLATFORM="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator.sdk -miphoneos-version-min=8.0 -m64" 
    sdk=iPhoneSimulator
  fi
  export PLATFORM
  export sdk
  echo $PLATFORM
  make -f Ios64.mk clean
  make -f Ios64.mk
done

lipo libcomplex_script_layoutarmv7.a libcomplex_script_layoutarmv7s.a libcomplex_script_layouti386.a libcomplex_script_layoutx86_64.a -output libcomplex_script_layout.a -create
#lipo libcomplex_script_layoutarmv7.a libcomplex_script_layoutarmv7s.a libcomplex_script_layoutx86_64.a -output libcomplex_script_layout.a -create
#mv libcomplex_script_layoutx$(ARCH).a libcomplex_script_layout.a
