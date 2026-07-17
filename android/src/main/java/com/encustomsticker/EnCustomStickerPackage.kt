package com.encustomsticker

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class EnCustomStickerPackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(EnCustomStickerViewManager())
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == "StickerProcessor") {
      StickerProcessorModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    val map = HashMap<String, ReactModuleInfo>()
    
    // Registering our Java StickerProcessor module inside the New Architecture map
    map["StickerProcessor"] = ReactModuleInfo(
      "StickerProcessor",                // name
      "com.encustomsticker.StickerProcessorModule", // className
      false,                            // canOverrideExistingModule
      false,                            // needsEagerInit
      true,                             // hasConstants
      false,                            // isCxxModule
      false                             // isTurboModule 
    )
    
    map
  }
}