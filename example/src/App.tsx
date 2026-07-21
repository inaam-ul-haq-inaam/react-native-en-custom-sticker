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
      <Text style={styles.title}>Sticker Maker App</Text>

      <Button
        title="Open Custom Sticker Menu"
        color='rgba(67, 105, 135, 1)'
        onPress={() =>
          openStickerPopup({
            actionMenu: {
              labels: {
                title: 'Create Sticker',
                subtitle: 'Add a photo to create your sticker',
                camera: 'Camera',
                cameraSubtitle: 'Take a new photo',
                gallery: 'Gallery',
                gallerySubtitle: 'Choose from gallery',
                cancel: 'Cancel',
              },
              theme: {
                titleColor: 'white',
                textColor: 'white',
                backgroundColor: '#0f172a',
                overlayColor: 'rgba(0, 0, 0, 0.06)',
              },
              sequence: ['camera', 'gallery', 'cancel'],
            },
            loader: {
              loadingText: 'Generating Sticker...',
              loadingSubtitle: 'Please wait .......',
              theme: {
                spinnerColor: '#60a5fa',
                backgroundColor: '#1e293b',
                textColor: 'white',
              },
            },
            editor: {
              recipientName: 'inaam ul haq',
              theme: {
                backgroundColor: 'rgba(37, 79, 142, 0.12)',
                bottomBarColor: 'rgba(32, 67, 99, 0.38)',
                headerIconColor: '#0b0b0bff',
                favoriteIconColor: '#E74C3C',
                sendButtonColor: '#3766b6ff',
                thumbnailBorderColor: '#446387ff',
              },
              textEditor: {
                labels: {
                  done: 'Done',
                  placeholder: 'Type your text...',
                },
                theme: {
                  overlayColor: 'rgba(0, 0, 0, 0.64)',
                  doneColor: '#e2e5ebff',
                  iconColor: '#FFFFFF',
                },
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
