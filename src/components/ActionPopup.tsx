import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import type { ActionMenuConfig, StickerMakerActions } from '../types/types';

interface ActionPopupProps {
  isVisible: boolean;
  onClose: () => void;
  actionMenu?: ActionMenuConfig;
  actions?: StickerMakerActions;
}

export const ActionPopup: React.FC<ActionPopupProps> = ({
  isVisible,
  onClose,
  actionMenu,
  actions,
}) => {
  const textColor = actionMenu?.theme?.textColor || 'white';
  const titleColorVal = actionMenu?.theme?.titleColor || '#ffffff';
  const backgroundColor = actionMenu?.theme?.backgroundColor || '#0f172a';
  const overlayColor = actionMenu?.theme?.overlayColor || 'rgba(0, 0, 0, 0.6)';

  const titleTextStr = actionMenu?.labels?.title || 'Create Sticker';
  const subtitleTextStr = actionMenu?.labels?.subtitle || 'Add a photo to create your sticker';
  
  const cameraText = actionMenu?.labels?.camera || 'Camera';
  const cameraSubtitleText = actionMenu?.labels?.cameraSubtitle || 'Take a new photo';
  
  const galleryText = actionMenu?.labels?.gallery || 'Gallery';
  const gallerySubtitleText = actionMenu?.labels?.gallerySubtitle || 'Choose from gallery';
  
  const cancelText = actionMenu?.labels?.cancel || 'Cancel';

  const sequence = actionMenu?.sequence || ['camera', 'gallery', 'cancel'];

  const renderButton = (type: 'camera' | 'gallery' | 'cancel') => {
    let onPress = () => { };

    if (type === 'camera') {
      onPress = () => {
        onClose();
        if (actions?.onMediaAction) {
          actions.onMediaAction('camera');
        }
      };
    } else if (type === 'gallery') {
      onPress = () => {
        onClose();
        if (actions?.onMediaAction) {
          actions.onMediaAction('gallery');
        }
      };
    } else if (type === 'cancel') {
      onPress = onClose;
    }

    if (type === 'cancel') {
      return (
        <TouchableOpacity
          key={type}
          style={localStyles.cancelButton}
          onPress={onPress}
        >
          <Text style={localStyles.cancelButtonText}>{cancelText}</Text>
        </TouchableOpacity>
      );
    }

    const isCamera = type === 'camera';
    const title = isCamera ? cameraText : galleryText;
    const subtitle = isCamera ? cameraSubtitleText : gallerySubtitleText;
    const iconName = isCamera ? 'camera-outline' : 'image-outline';
    const gradientColors = isCamera ? ['#3b82f6', '#2563eb'] : ['#8b5cf6', '#6d28d9'];

    return (
      <TouchableOpacity
        key={type}
        style={localStyles.actionButton}
        onPress={onPress}
      >
        <View style={localStyles.actionButtonLeft}>
          <LinearGradient colors={gradientColors} style={localStyles.iconContainer}>
            <Icon name={iconName} size={22} color="#fff" />
          </LinearGradient>
          <View style={localStyles.textContainer}>
            <Text style={[localStyles.actionTitle, { color: textColor }]}>{title}</Text>
            <Text style={localStyles.actionSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[localStyles.overlay, { backgroundColor: overlayColor }]}>
          <TouchableWithoutFeedback>
            <View style={[localStyles.bottomSheetContainer, { backgroundColor }]}>
              <View style={localStyles.headerContainer}>
                <View style={localStyles.dragIndicator} />
                
                <View style={localStyles.topIconContainer}>
                   <Icon name="document-outline" size={24} color="#93c5fd" />
                </View>

                <Text style={[localStyles.titleText, { color: titleColorVal }]}>
                  {titleTextStr}
                </Text>
                
                <Text style={localStyles.subtitleText}>
                  {subtitleTextStr}
                </Text>
              </View>

              {sequence.map((btnType) => renderButton(btnType))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  topIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});
