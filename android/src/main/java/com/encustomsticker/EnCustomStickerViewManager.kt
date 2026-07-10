package com.encustomsticker

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.EnCustomStickerViewManagerInterface
import com.facebook.react.viewmanagers.EnCustomStickerViewManagerDelegate

@ReactModule(name = EnCustomStickerViewManager.NAME)
class EnCustomStickerViewManager : SimpleViewManager<EnCustomStickerView>(),
  EnCustomStickerViewManagerInterface<EnCustomStickerView> {
  private val mDelegate: ViewManagerDelegate<EnCustomStickerView>

  init {
    mDelegate = EnCustomStickerViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<EnCustomStickerView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): EnCustomStickerView {
    return EnCustomStickerView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: EnCustomStickerView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "EnCustomStickerView"
  }
}
