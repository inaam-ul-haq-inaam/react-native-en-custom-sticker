# 🎨 React Native EN Custom Sticker

A highly customizable, native-backed sticker creation library for React Native. This library allows users to select an image, automatically removes the background using **Google ML Kit** (Native Android), and provides a fully featured UI to preview, add text, and save the generated stickers.

---

## 🚀 Installation

```sh
npm install react-native-en-custom-sticker
# OR
yarn add react-native-en-custom-sticker
```

### Peer Dependencies
This library relies on several peer dependencies for UI and image processing. Make sure to install them in your project:
```sh
npm install react-native-vector-icons react-native-view-shot react-native-fast-image react-native-linear-gradient react-native-gesture-handler
```
*Note: Make sure to link `react-native-vector-icons` properly for Android/iOS.*

---

## 🛠️ Basic Usage

### 1. Wrap your app with `StickerProvider`
In your root component (e.g., `App.tsx`), wrap your application with the provider:

```tsx
import { StickerProvider } from 'react-native-en-custom-sticker';

export default function App() {
  return (
    <StickerProvider>
      <YourMainApp />
    </StickerProvider>
  );
}
```

### 2. Open the Sticker Maker
Use the `useStickerMaker` hook anywhere inside your app to open the sticker creation flow. We use a **Pure TypeScript** configuration object so you get full autocomplete in your IDE!

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useStickerMaker } from 'react-native-en-custom-sticker';

export const ChatScreen = () => {
  const { openStickerPopup } = useStickerMaker();

  const handleOpenSticker = () => {
    openStickerPopup({
      actionMenu: {
        labels: {
          title: 'Create Custom Sticker',
        },
        theme: {
          primaryColor: '#007AFF',
        },
      },
      editor: {
        recipientName: 'Ali Raza', 
      },
      actions: {
        onMediaAction: (action) => {
          if (action === 'camera') console.log('Open Camera');
          if (action === 'gallery') console.log('Open Gallery');
        },
        onStickerAction: (action, uri) => {
          if (action === 'send') console.log('Send this sticker:', uri);
          if (action === 'favorite') console.log('Save to favorites:', uri);
        },
      }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Make a Sticker" onPress={handleOpenSticker} />
    </View>
  );
};
```

---

## 📖 API Reference

### `openStickerPopup(options?: StickerMakerOptions)`
Calling this method opens the bottom sheet menu to start the sticker creation process. 

#### `StickerMakerOptions`
This is a nested configuration object that gives you full control over the plugin's UI and behavior. Thanks to strict typings, your IDE will auto-suggest all these properties!

| Property | Type | Description |
|----------|------|-------------|
| `actionMenu` | `ActionMenuConfig` | Styles and text for the initial Camera/Gallery popup. |
| `loader` | `LoaderConfig` | Styles for the loading screen (shown during ML Kit processing). |
| `editor` | `EditorConfig` | Styles for the final sticker editor/preview screen. |
| `actions` | `StickerMakerActions` | Event callbacks triggered by user actions. |

---

### 🎨 Theming & Configuration Breakdown

#### 1. `ActionMenuConfig`
Controls the Camera/Gallery selection popup.
* `labels` (Object) - Override default texts: `{ title, camera, gallery, cancel }`
* `theme` (Object) - Override colors: `{ titleColor, primaryColor, textColor }`
* `sequence` (Array) - Order of buttons. Default: `['camera', 'gallery', 'cancel']`

#### 2. `LoaderConfig`
Controls the loading screen shown while the AI removes the background.
* `loadingText` (string) - Text to show while processing.
* `theme` (Object) - Override colors: `{ spinnerColor, overlayColor }`

#### 3. `EditorConfig`
Controls the final sticker preview screen where the user can add text.
* `recipientName` (string) - Displays a name between the Favorite and Send buttons.
* `theme` (Object) - Override UI colors: `{ backgroundColor, bottomBarColor, headerIconColor, favoriteIconColor, sendButtonColor, thumbnailBorderColor }`

#### 4. `StickerMakerActions` (Events)
A clean, single-prop event dispatcher for handling user actions.
* `onMediaAction(action: 'camera' | 'gallery')` - Fired when the user selects a media source. You should open the camera or gallery in your app logic here.
* `onStickerAction(action: 'send' | 'favorite', uri: string)` - Fired from the editor. `uri` contains the final flattened sticker image path.

---

## 🏗 Architecture & Features
* **Google ML Kit Subject Segmentation:** Native Android integration ensures fast, offline, and accurate background removal.
* **React Native View Shot:** Automatically captures any text overlays added by the user onto the transparent sticker.
* **Professional API Design:** Grouped `theme` and `labels` objects with single-prop event dispatchers (`onMediaAction`, `onStickerAction`) provide a clean, scalable, and standard React Native developer experience.

## 📄 License
MIT
