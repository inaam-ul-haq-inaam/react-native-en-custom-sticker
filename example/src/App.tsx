import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import {
  StickerProvider,
  useStickerMaker,
} from 'react-native-en-custom-sticker';
import ImagePicker from 'react-native-image-crop-picker';

export default function App() {
  return (
    <StickerProvider>
      <AppContent />
    </StickerProvider>
  );
}

function AppContent() {
  const { openStickerPopup, openEditor } = useStickerMaker();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUri) {
      openEditor(selectedUri);
      setSelectedUri(null);
    }
  }, [selectedUri, openEditor]);

  const handleCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({ cropping: false });
      setSelectedUri(image.path);
    } catch (error) {
      console.log('User cancelled or error:', error);
    }
  };

  const handleGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({ cropping: false });
      setSelectedUri(image.path);
    } catch (error) {
      console.log('User cancelled or error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sticker Maker Example</Text>

      <Button
        title="Open Custom Sticker Menu"
        color="green"
        onPress={() =>
          openStickerPopup({
            actionMenu: {
              labels: {
                title: 'Create Chain Sticker',
                camera: 'Snap a Photo',
                gallery: 'Choose from Camera Roll',
                cancel: 'Cancel',
              },
              theme: {
                titleColor: 'black',
                primaryColor: 'black',
                textColor: 'white',
              },
              sequence: ['camera', 'gallery', 'cancel'],
            },
            loader: {
              loadingText: 'Generating Masterpiece...',
              theme: {
                spinnerColor: '#FFD700',
                overlayColor: 'rgba(0, 0, 0, 0.8)',
              },
            },
            editor: {
              recipientName: 'Ali Raza',
              theme: {
                backgroundColor: 'rgba(46, 54, 45, 0.23)',
                bottomBarColor: 'rgba(41, 87, 130, 0.38)',
                headerIconColor: '#F39C12',
                favoriteIconColor: '#E74C3C',
                sendButtonColor: '#27AE60',
                thumbnailBorderColor: '#9B59B6',
              },
            },
            actions: {
              onMediaAction: (action) => {
                if (action === 'camera') handleCamera();
                else if (action === 'gallery') handleGallery();
              },
              onStickerAction: (action, uri) => {
                if (action === 'send') console.log('Sending sticker to chat:', uri);
                else if (action === 'favorite') console.log('Saving sticker to favorites:', uri);
              },
            },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
