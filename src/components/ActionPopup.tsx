import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
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
  const primaryColor = actionMenu?.theme?.primaryColor || 'black';
  const textColor = actionMenu?.theme?.textColor || 'white';
  const titleColorVal = actionMenu?.theme?.titleColor || '#333';
  
  const cameraText = actionMenu?.labels?.camera || 'Take a Photo';
  const galleryText = actionMenu?.labels?.gallery || 'Choose from Gallery';
  const cancelText = actionMenu?.labels?.cancel || 'Cancel';
  const titleTextStr = actionMenu?.labels?.title || 'Select Image Source';
  
  const sequence = actionMenu?.sequence || ['camera', 'gallery', 'cancel'];

  const renderButton = (type: 'camera' | 'gallery' | 'cancel') => {
    let text = '';
    let onPress = () => {};

    if (type === 'camera') {
      text = cameraText;
      onPress = () => {
        onClose();
        if (actions?.onMediaAction) {
          actions.onMediaAction('camera');
        }
      };
    } else if (type === 'gallery') {
      text = galleryText;
      onPress = () => {
        onClose();
        if (actions?.onMediaAction) {
          actions.onMediaAction('gallery');
        }
      };
    } else if (type === 'cancel') {
      text = cancelText;
      onPress = onClose;
    }

    return (
      <TouchableOpacity
        key={type}
        style={[
          localStyles.button,
          { backgroundColor: type === 'cancel' ? '#E5E5EA' : primaryColor },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            localStyles.buttonText,
            { color: type === 'cancel' ? '#FF3B30' : textColor },
          ]}
        >
          {text}
        </Text>
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
        <View style={localStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={localStyles.bottomSheetContainer}>
              <View style={localStyles.dragIndicator} />
              
              <Text style={[localStyles.titleText, { color: titleColorVal }]}>
                {titleTextStr}
              </Text>

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36, // Extra padding for safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#DDDDDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
