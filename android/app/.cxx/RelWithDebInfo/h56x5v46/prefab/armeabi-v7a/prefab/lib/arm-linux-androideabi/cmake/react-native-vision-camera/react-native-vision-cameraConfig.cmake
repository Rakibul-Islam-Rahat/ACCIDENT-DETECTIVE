if(NOT TARGET react-native-vision-camera::VisionCamera)
add_library(react-native-vision-camera::VisionCamera SHARED IMPORTED)
set_target_properties(react-native-vision-camera::VisionCamera PROPERTIES
    IMPORTED_LOCATION "D:/App/MINI-DETECTIVE/node_modules/react-native-vision-camera/android/build/intermediates/cxx/RelWithDebInfo/5me3p65g/obj/armeabi-v7a/libVisionCamera.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/App/MINI-DETECTIVE/node_modules/react-native-vision-camera/android/build/headers/visioncamera"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

