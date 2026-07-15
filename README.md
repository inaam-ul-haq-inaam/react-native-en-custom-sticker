React Native EN Custom Sticker 🎨
A highly customizable, native-backed sticker creation library for React Native. This library allows users to select an image, automatically removes the background using Google ML Kit (Native Android), and provides a fully featured UI to preview, add text, and save the generated stickers.

🚀 Installation
sh

npm install react-native-en-custom-sticker
# OR
yarn add react-native-en-custom-sticker
Peer Dependencies
This library relies on several peer dependencies for UI and image processing. Make sure to install them in your project:

sh

npm install react-native-vector-icons react-native-view-shot react-native-fast-image react-native-linear-gradient react-native-gesture-handler
Note: Make sure to link react-native-vector-icons properly for Android/iOS.

🛠 Basic Usage
1. Wrap your app with StickerProvider
In your root component (e.g., App.tsx), wrap your application with the provider:

tsx

import { StickerProvider } from 'react-native-en-custom-sticker';
export default function App() {
  return (
    <StickerProvider>
      <YourMainApp />
    </StickerProvider>
  );
}
2. Open the Sticker Maker
Use the useStickerMaker hook anywhere inside your app to open the sticker creation flow.

tsx

import React from 'react';
import { View, Button } from 'react-native';
import { useStickerMaker } from 'react-native-en-custom-sticker';
export const ChatScreen = () => {
  const { openStickerPopup } = useStickerMaker();
  const handleOpenSticker = () => {
    openStickerPopup({
      actionMenu: {
        titleText: 'Create Custom Sticker',
        primaryColor: '#007AFF',
      },
      editor: {
        recipientName: 'Ali Raza', // Shown in the bottom bar
      },
      actions: {
        onSendSticker: (finalUri) => {
          console.log('Send this sticker in chat:', finalUri);
        },
        onFavoriteSticker: (finalUri) => {
          console.log('Save to favorites:', finalUri);
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

📖 API Reference
openStickerPopup(options?: StickerMakerOptions)
Calling this method opens the bottom sheet menu to start the sticker creation process.

StickerMakerOptions
This is a nested configuration object that gives you full control over the plugin's UI and behavior.

Property	Type	Description
actionMenu	ActionMenuConfig	Styles for the first bottom sheet (Camera/Gallery selection).
loader	LoaderConfig	Styles for the loading screen (shown during ML Kit processing).
editor	EditorConfig	Styles for the final sticker editor/preview screen.
actions	StickerMakerActions	Callbacks triggered by user actions.
Configurations Breakdown

1. ActionMenuConfig
Controls the Camera/Gallery selection popup.

titleText (string) - Default: "Create Chain Sticker"
titleColor (string)
cameraText (string)
galleryText (string)
cancelText (string)
primaryColor (string) - Default: "#0ea5e9"
textColor (string)
sequence (Array) - Default: ['camera', 'gallery', 'cancel']


2. LoaderConfig
Controls the loading screen shown while the AI removes the background.

loadingText (string) - Default: "Generating Chain..."
spinnerColor (string) - Default: "#0ea5e9"
overlayColor (string) - Default: "rgba(0, 0, 0, 0.6)"


3. EditorConfig
Controls the final sticker preview screen where the user can add text.

recipientName (string) - Displays a name between the Favorite and Send buttons.
backgroundColor (string)
bottomBarColor (string)
headerIconColor (string)
favoriteIconColor (string)
sendButtonColor (string)
thumbnailBorderColor (string)


4. StickerMakerActions (Callbacks)
Listen to user interactions.

onCameraSelect() - Triggered when camera is selected. (Library handles camera launch automatically if implemented, or fires this).
onGallerySelect() - Triggered when gallery is selected.
onFavoriteSticker(uri: string) - Triggered when the user hits Send and the favorite (heart) icon was active.
onSendSticker(uri: string) - Triggered when the user hits Send. Provides the final flattened image URI.


🏗 Architecture & Features
Google ML Kit Subject Segmentation: Native Android integration ensures fast, offline, and accurate background removal.
React Native View Shot: Automatically captures any text overlays added by the user onto the transparent sticker.
Declarative API: The nested configuration pattern (actionMenu, loader, editor, actions) makes it extremely easy to re-brand the sticker plugin for any host app.
📄 License
MIT
