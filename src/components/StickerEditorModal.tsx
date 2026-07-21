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
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { DraggableStickerText, type StickerTextData } from './DraggableStickerText';
import { TextEditorModal } from './TextEditorModal';
import ViewShot from 'react-native-view-shot';
import type { LoaderConfig, EditorConfig, StickerMakerActions } from '../types/types';

const COLORS = {
  surface: '#446387',
  background: '#2c4058',
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  border: '#65798f',
  primary: '#436987',
  accent: '#65798f',
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
  const [isAddingText, setIsAddingText] = useState(false);

  const viewShotRef = useRef<any>(null);

  // Loader overrides
  const loadingText = loader?.loadingText || 'Creating Sticker...';
  const loadingSubtitle = loader?.loadingSubtitle || 'Please wait a moment...';
  const spinnerColor = loader?.theme?.spinnerColor || COLORS.accent;
  const overlayColor = loader?.theme?.overlayColor || 'rgba(0, 0, 0, 0.6)';
  const loaderBgColor = loader?.theme?.backgroundColor || '#0f172a';
  const loaderTextColor = loader?.theme?.textColor || '#ffffff';

  // Editor styling overrides
  const editorBgColor = editor?.theme?.backgroundColor || 'rgba(0, 0, 0, 0.7)';
  const bottomBarColor = editor?.theme?.bottomBarColor || COLORS.surface;
  const headerIconColor = editor?.theme?.headerIconColor || COLORS.textPrimary;
  const favoriteIconColor = editor?.theme?.favoriteIconColor || COLORS.accent;
  const sendButtonColor = editor?.theme?.sendButtonColor || COLORS.accent;
  const thumbnailBorderColor = editor?.theme?.thumbnailBorderColor || COLORS.primary;

  const textEditorOverlayColor = editor?.textEditor?.theme?.overlayColor || 'rgba(0,0,0,0.6)';
  const textEditorDoneColor = editor?.textEditor?.theme?.doneColor || 'white';
  const textEditorIconColor = editor?.textEditor?.theme?.iconColor || 'white';
  const textEditorDoneText = editor?.textEditor?.labels?.done || 'Done';
  const textEditorPlaceholderText = editor?.textEditor?.labels?.placeholder || 'Type something...';

  // Icon overrides
  const closeIconName = editor?.icons?.close || 'close';
  const textIconName = editor?.icons?.text || 'text-outline';
  const favoriteIconName = editor?.icons?.favorite || 'heart-outline';
  const favoriteActiveIconName = editor?.icons?.favoriteActive || 'heart';
  const sendIconName = editor?.icons?.send || 'send';

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

  const handleDoneEditingText = (textData: Partial<StickerTextData>) => {
    if (textData.text?.trim() !== '') {
      if (editingTextId) {
        setTexts(prev =>
          prev.map(t =>
            t.id === editingTextId
              ? ({ ...t, ...textData } as StickerTextData)
              : t,
          ),
        );
      } else {
        setTexts(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: textData.text!,
            color: textData.color!,
            bgColor: textData.bgColor!,
          },
        ]);
      }
    } else if (editingTextId) {
      setTexts(prev => prev.filter(t => t.id !== editingTextId));
    }
    setIsAddingText(false);
    setEditingTextId(null);
  };

  const handleAddText = () => {
    setEditingTextId(null);
    setIsAddingText(true);
  };

  const handleEditText = (item: StickerTextData) => {
    setEditingTextId(item.id);
    setIsAddingText(true);
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
        <SafeAreaView style={[styles.fullScreenPreviewContainer, { backgroundColor: editorBgColor }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={handleCancelPreview} style={styles.closePreviewBtn}>
                <Icon name={closeIconName} size={24} color={headerIconColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddText} style={styles.textModeBtn}>
                <Icon name={textIconName} size={24} color={headerIconColor} />
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
                    <Text style={styles.thumbnailBadgeText}>Sticker</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Bar */}
            <View style={[styles.previewBottomBar, { backgroundColor: bottomBarColor }]}>
              <TouchableOpacity style={styles.favoriteIconBtn} onPress={handleToggleFavorite}>
                <Icon
                  name={isFavorite ? favoriteActiveIconName : favoriteIconName}
                  size={26}
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
                <Icon name={sendIconName} size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </GestureHandlerRootView>

      {/* Text Input Modal */}
      <TextEditorModal
        isVisible={isAddingText}
        onClose={() => setIsAddingText(false)}
        onDone={handleDoneEditingText}
        initialTextData={editingTextId ? texts.find(t => t.id === editingTextId) || null : null}
        overlayColor={textEditorOverlayColor}
        iconColor={textEditorIconColor}
        doneColor={textEditorDoneColor}
        doneText={textEditorDoneText}
        placeholderText={textEditorPlaceholderText}
      />

      {/* Processing Overlay */}
      {processingSticker && (
        <View style={[styles.overlayContainer, { backgroundColor: overlayColor }]}>
          <View style={[styles.overlayBox, { backgroundColor: loaderBgColor }]}>
            <View style={styles.loaderIconContainer}>
              <Icon name="color-wand-outline" size={24} color={spinnerColor} />
            </View>
            <ActivityIndicator size="large" color={spinnerColor} style={{ marginBottom: 16 }} />
            <Text style={[styles.overlayText, { color: loaderTextColor }]}>{loadingText}</Text>
            <Text style={styles.overlaySubtitle}>{loadingSubtitle}</Text>
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
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  closePreviewBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textModeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  favoriteIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recipientNameText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loaderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
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
