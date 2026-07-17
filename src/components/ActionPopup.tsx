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
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={localStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={localStyles.dialogContainer}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
