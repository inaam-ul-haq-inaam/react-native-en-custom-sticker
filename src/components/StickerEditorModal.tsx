import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  NativeModules,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  ImageBackground,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';
import type { LoaderConfig, EditorConfig, StickerMakerActions } from '../types/types';

const COLORS = {
  surface: '#1e293b',
  background: '#0f172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#0284c7',
  accent: '#38bdf8',
};

export interface StickerTextData {
  id: string;
  text: string;
  color: string;
  bgColor: string;
}

const DraggableStickerText = ({
  item,
  onPress,
  isEditing,
}: {
  item: StickerTextData;
  onPress: () => void;
  isEditing: boolean;
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const lastScale = useRef(1);

  const panRef = useRef(null);
  const pinchRef = useRef(null);
  const tapRef = useRef(null);

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false },
  );

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      pan.extractOffset();
    }
  };

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: false },
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      baseScale.setValue(lastScale.current);
      pinchScale.setValue(1);
    }
  };

  const onTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      onPress();
    }
  };

  return (
    <PanGestureHandler
      ref={panRef}
      onGestureEvent={onPanGestureEvent}
      onHandlerStateChange={onPanStateChange}
      simultaneousHandlers={[pinchRef, tapRef]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: '40%',
          opacity: isEditing ? 0 : 1,
        }}
      >
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchStateChange}
          simultaneousHandlers={[panRef, tapRef]}
        >
          <Animated.View
            style={[
              pan.getLayout(),
              {
                padding: 10,
                backgroundColor: item.bgColor || 'transparent',
                borderRadius: 8,
                transform: [{ scale: scale }],
              },
            ]}
          >
            <TapGestureHandler
              ref={tapRef}
              onHandlerStateChange={onTap}
              simultaneousHandlers={[panRef, pinchRef]}
            >
              <Animated.View>
                <Text
                  style={{
                    color: item.color || '#FFF',
                    fontSize: 28,
                    fontWeight: 'bold',
                  }}
                >
                  {item.text}
                </Text>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

export interface StickerEditorModalProps {
  uri: string | null;
  onClose: () => void;
  actions?: StickerMakerActions;
  loader?: LoaderConfig;
  editor?: EditorConfig;
}

export const StickerEditorModal: React.FC<StickerEditorModalProps> = ({ 
  uri, 
  onClose, 
  actions,
  loader,
  editor,
}) => {
  const [processingSticker, setProcessingSticker] = useState(false);
  const [previewStickerUrl, setPreviewStickerUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'sticker' | 'original'>('sticker');
  const [isFavorite, setIsFavorite] = useState(false);

  // Overlay Text State
  const [texts, setTexts] = useState<StickerTextData[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [textColor, setTextColor] = useState('white');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [sliderMode, setSliderMode] = useState<'text' | 'bg'>('text');

  const textInputRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);

  // Loader overrides
  const loadingText = loader?.loadingText || 'Creating Chain Sticker...';
  const spinnerColor = loader?.theme?.spinnerColor || COLORS.accent;
  const overlayColor = loader?.theme?.overlayColor || 'rgba(0, 0, 0, 0.6)';

  // Editor styling overrides
  const editorBgColor = editor?.theme?.backgroundColor || 'rgba(91, 74, 74, 0.42)';
  const bottomBarColor = editor?.theme?.bottomBarColor || COLORS.surface;
  const headerIconColor = editor?.theme?.headerIconColor || COLORS.textPrimary;
  const favoriteIconColor = editor?.theme?.favoriteIconColor || COLORS.accent;
  const sendButtonColor = editor?.theme?.sendButtonColor || COLORS.accent;
  const thumbnailBorderColor = editor?.theme?.thumbnailBorderColor || COLORS.primary;

  useEffect(() => {
    if (uri) {
      processSticker(uri);
    } else {
      handleCancelPreview();
    }
  }, [uri]);

  const processSticker = async (imagePath: string) => {
    setOriginalImageUrl(imagePath);
    setPreviewMode('sticker');
    setProcessingSticker(true);

    try {
      const { StickerProcessor } = NativeModules;
      if (!StickerProcessor) {
        throw new Error('Native StickerProcessor module is not linked properly.');
      }

      await new Promise(resolve => setTimeout(resolve, 50));
      const outPath = await StickerProcessor.processSticker(imagePath);
      setPreviewStickerUrl(outPath);
    } catch (error: any) {
      console.error('Error processing sticker natively:', error);
      Alert.alert('Processing Error', error?.message || 'Failed to create sticker from image.');
      // Fallback for development if native module fails
      setPreviewStickerUrl(imagePath);
    } finally {
      setProcessingSticker(false);
    }
  };

  const flattenAndGetUri = async (): Promise<string | null> => {
    const currentBaseUrl = previewMode === 'sticker' ? previewStickerUrl : originalImageUrl;
    if (!currentBaseUrl) return null;
    if (texts.length === 0) return currentBaseUrl;
    if (viewShotRef.current) {
      try {
        const resultUri = await viewShotRef.current.capture();
        return resultUri;
      } catch (e) {
        console.error('Error flattening image:', e);
        return currentBaseUrl;
      }
    }
    return currentBaseUrl;
  };

  const handleDoneEditingText = () => {
    if (overlayText.trim() !== '') {
      if (editingTextId) {
        setTexts(prev =>
          prev.map(t =>
            t.id === editingTextId
              ? { ...t, text: overlayText, color: textColor, bgColor: textBgColor }
              : t,
          ),
        );
      } else {
        setTexts(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: overlayText,
            color: textColor,
            bgColor: textBgColor,
          },
        ]);
      }
    } else if (editingTextId) {
      setTexts(prev => prev.filter(t => t.id !== editingTextId));
    }
    setIsAddingText(false);
    setEditingTextId(null);
    setOverlayText('');
    setTextColor('white');
    setTextBgColor('transparent');
    setSliderMode('text');
  };

  const handleAddText = () => {
    setEditingTextId(null);
    setOverlayText('');
    setTextColor('white');
    setTextBgColor('transparent');
    setSliderMode('text');
    setIsAddingText(true);
  };

  const handleEditText = (item: StickerTextData) => {
    setEditingTextId(item.id);
    setOverlayText(item.text);
    setTextColor(item.color);
    setTextBgColor(item.bgColor || 'transparent');
    setSliderMode('text');
    setIsAddingText(true);
  };

  const onColorSliderEvent = (event: any) => {
    const y = event.nativeEvent.y;
    let hue = (y / 300) * 360;
    if (hue < 0) hue = 0;
    if (hue > 360) hue = 360;
    const newColor = `hsl(${Math.round(hue)}, 100%, 50%)`;
    if (sliderMode === 'text') {
      setTextColor(newColor);
    } else {
      setTextBgColor(newColor);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleSendPreview = async () => {
    if (previewStickerUrl || originalImageUrl) {
      const finalUri = await flattenAndGetUri();
      if (!finalUri) return;

      if (isFavorite && actions?.onStickerAction) {
        actions.onStickerAction('favorite', finalUri);
      }

      if (actions?.onStickerAction) {
        actions.onStickerAction('send', finalUri);
      }
      
      handleCancelPreview();
    }
  };

  const handleCancelPreview = () => {
    setPreviewStickerUrl(null);
    setOriginalImageUrl(null);
    setPreviewMode('sticker');
    setTexts([]);
    setEditingTextId(null);
    setOverlayText('');
    setTextColor('white');
    setIsFavorite(false);
    onClose();
  };

  return (
    <Modal
      visible={!!uri}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCancelPreview}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground
          source={{
            uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png',
          }}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView style={[styles.fullScreenPreviewContainer, { backgroundColor: editorBgColor }]}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              {/* Header */}
              <View style={styles.previewHeader}>
                <TouchableOpacity onPress={handleCancelPreview} style={styles.closePreviewBtn}>
                  <Icon name="close" size={28} color={headerIconColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddText} style={styles.textModeBtn}>
                  <Icon name="text-outline" size={28} color={headerIconColor} />
                </TouchableOpacity>
              </View>

              {/* Center Image */}
              <View style={styles.previewCenter}>
                {(previewStickerUrl || originalImageUrl) && (
                  <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                    <View
                      style={{
                        width: Dimensions.get('window').width * 0.8,
                        height: Dimensions.get('window').height * 0.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FastImage
                        source={{
                          uri: previewMode === 'sticker' ? previewStickerUrl || '' : originalImageUrl || '',
                          priority: FastImage.priority.high,
                        }}
                        style={{ width: '100%', height: '100%' } as any}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      {texts.map(t => (
                        <DraggableStickerText
                          key={t.id}
                          item={t}
                          onPress={() => handleEditText(t)}
                          isEditing={isAddingText && editingTextId === t.id}
                        />
                      ))}
                    </View>
                  </ViewShot>
                )}
              </View>

              {/* Thumbnails Row */}
              {(previewStickerUrl || originalImageUrl) && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15, gap: 20 }}>
                  <TouchableOpacity
                    onPress={() => setPreviewMode('original')}
                    style={[
                      styles.thumbnailBox, 
                      previewMode === 'original' && { borderColor: thumbnailBorderColor }
                    ]}
                  >
                    <FastImage
                      source={{ uri: originalImageUrl || '' }}
                      style={{ width: '100%', height: '100%' } as any}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={styles.thumbnailBadge}>
                      <Text style={styles.thumbnailBadgeText}>Original</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPreviewMode('sticker')}
                    style={[
                      styles.thumbnailBox, 
                      previewMode === 'sticker' && { borderColor: thumbnailBorderColor }
                    ]}
                  >
                    <FastImage
                      source={{ uri: previewStickerUrl || '' }}
                      style={{ width: '100%', height: '100%' } as any}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                    <View style={styles.thumbnailBadge}>
                      <Text style={styles.thumbnailBadgeText}>Chain Sticker</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Bar */}
              <View style={[styles.previewBottomBar, { backgroundColor: bottomBarColor }]}>
                <TouchableOpacity style={styles.favoriteIconBtn} onPress={handleToggleFavorite}>
                  <Icon
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={28}
                    color={favoriteIconColor}
                  />
                </TouchableOpacity>

                {editor?.recipientName && (
                  <Text style={styles.recipientNameText}>
                    {editor.recipientName}
                  </Text>
                )}

                <TouchableOpacity 
                  style={[styles.sendIconBtn, { backgroundColor: sendButtonColor }]} 
                  onPress={handleSendPreview}
                >
                  <Icon name="send" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </GestureHandlerRootView>

      {/* Text Input Modal */}
      <Modal
        visible={isAddingText}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddingText(false)}
        onShow={() => {
          setTimeout(() => textInputRef.current?.focus(), 300);
        }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.textInputOverlayCenter}
          >
            <View
              style={[
                styles.textInputHeaderTop,
                {
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  right: 0,
                  left: 0,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSliderMode('text')}
                  style={{
                    padding: 8,
                    marginRight: 10,
                    borderBottomWidth: sliderMode === 'text' ? 2 : 0,
                    borderBottomColor: 'white',
                  }}
                >
                  <Icon name="text" size={24} color={sliderMode === 'text' ? textColor : 'white'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSliderMode('bg')}
                  style={{
                    padding: 8,
                    marginRight: 10,
                    borderBottomWidth: sliderMode === 'bg' ? 2 : 0,
                    borderBottomColor: 'white',
                  }}
                >
                  <Icon
                    name="color-palette"
                    size={24}
                    color={
                      sliderMode === 'bg'
                        ? textBgColor !== 'transparent'
                          ? textBgColor
                          : 'white'
                        : 'white'
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTextBgColor('transparent')} style={{ padding: 8 }}>
                  <Icon name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleDoneEditingText}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    justifyContent: 'flex-start',
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vertical Color Slider */}
            <View style={styles.colorSliderContainer}>
              <PanGestureHandler
                onGestureEvent={onColorSliderEvent}
                onHandlerStateChange={onColorSliderEvent}
              >
                <Animated.View style={styles.colorSliderTrack}>
                  <LinearGradient
                    colors={[
                      '#FF0000',
                      '#FFFF00',
                      '#00FF00',
                      '#00FFFF',
                      '#0000FF',
                      '#FF00FF',
                      '#FF0000',
                    ]}
                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                  />
                </Animated.View>
              </PanGestureHandler>
            </View>

            <TextInput
              ref={textInputRef}
              style={[
                styles.overlayTextInputCenter,
                {
                  color: textColor,
                  backgroundColor: textBgColor,
                  padding: 10,
                  borderRadius: 8,
                },
              ]}
              value={overlayText}
              onChangeText={setOverlayText}
              placeholder="Type something..."
              placeholderTextColor={
                textBgColor !== 'transparent' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'
              }
              multiline
            />
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </Modal>

      {/* Processing Overlay */}
      {processingSticker && (
        <View style={[styles.overlayContainer, { backgroundColor: overlayColor }]}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color={spinnerColor} />
            <Text style={styles.overlayText}>{loadingText}</Text>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenPreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(91, 74, 74, 0.42)',
  },
  previewHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  closePreviewBtn: {
    padding: 5,
  },
  textModeBtn: {
    padding: 5,
  },
  previewCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  favoriteIconBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientNameText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  sendIconBtn: {
    backgroundColor: COLORS.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayBox: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  textInputOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputHeaderTop: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  colorSliderContainer: {
    position: 'absolute',
    right: 20,
    top: 150,
    width: 20,
    height: 300,
    zIndex: 10,
  },
  colorSliderTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  overlayTextInputCenter: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '90%',
    minWidth: 50,
    alignSelf: 'center',
  },
  thumbnailBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeThumbnail: {
    borderColor: COLORS.primary,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
  },
  thumbnailBadgeText: {
    color: '#FFF',
    fontSize: 10,
    textAlign: 'center',
  },
});
