import { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import type { StickerTextData } from './DraggableStickerText';

interface TextEditorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDone: (textData: Partial<StickerTextData>) => void;
  initialTextData: Partial<StickerTextData> | null;
  overlayColor: string;
  iconColor: string;
  doneColor: string;
  doneText: string;
  placeholderText: string;
}

export const TextEditorModal = ({
  isVisible,
  onClose,
  onDone,
  initialTextData,
  overlayColor,
  iconColor,
  doneColor,
  doneText,
  placeholderText,
}: TextEditorModalProps) => {
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('white');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [lastBgColor, setLastBgColor] = useState('#000000');
  const [sliderMode, setSliderMode] = useState<'text' | 'bg'>('text');
  const [textSliderY, setTextSliderY] = useState(0);
  const [bgSliderY, setBgSliderY] = useState(0);

  const textInputRef = useRef<any>(null);

  useEffect(() => {
    if (isVisible) {
      setOverlayText(initialTextData?.text || '');
      setTextColor(initialTextData?.color || 'white');
      setTextBgColor(initialTextData?.bgColor || 'transparent');
      if (initialTextData?.bgColor && initialTextData.bgColor !== 'transparent') {
        setLastBgColor(initialTextData.bgColor);
      } else {
        setLastBgColor('#000000');
      }
      setSliderMode('text');
    }
  }, [isVisible, initialTextData]);

  const onColorSliderEvent = (event: any) => {
    let y = event.nativeEvent.y;
    if (y < 0) y = 0;
    if (y > 300) y = 300;

    let newColor = '';
    if (y <= 37.5) {
      const lightness = (y / 37.5) * 50;
      newColor = `hsl(0, 100%, ${Math.round(lightness)}%)`;
    } else if (y >= 262.5) {
      const lightness = 50 + ((y - 262.5) / 37.5) * 50;
      newColor = `hsl(0, 100%, ${Math.round(lightness)}%)`;
    } else {
      const hue = ((y - 37.5) / 225) * 360;
      newColor = `hsl(${Math.round(hue)}, 100%, 50%)`;
    }

    if (sliderMode === 'text') {
      setTextColor(newColor);
      setTextSliderY(y);
    } else {
      setTextBgColor(newColor);
      setLastBgColor(newColor);
      setBgSliderY(y);
    }
  };

  const handleDone = () => {
    onDone({
      text: overlayText,
      color: textColor,
      bgColor: textBgColor,
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        setTimeout(() => textInputRef.current?.focus(), 300);
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.textInputOverlayCenter, { backgroundColor: overlayColor }]}
        >
          <View style={styles.textInputHeaderTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setSliderMode('text')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: sliderMode === 'text' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Icon name="text" size={24} color={sliderMode === 'text' ? textColor : iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (textBgColor === 'transparent') {
                    setTextBgColor(lastBgColor);
                    setSliderMode('bg');
                  } else {
                    setTextBgColor('transparent');
                    setSliderMode('text');
                  }
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: sliderMode === 'bg' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name="color-palette"
                  size={24}
                  color={
                    sliderMode === 'bg'
                      ? textBgColor !== 'transparent'
                        ? textBgColor
                        : iconColor
                      : iconColor
                  }
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              onPress={handleDone}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ color: doneColor, fontSize: 16, fontWeight: 'bold' }}>
                {doneText}
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
                    'black',
                    '#FF0000',
                    '#FFFF00',
                    '#00FF00',
                    '#00FFFF',
                    '#0000FF',
                    '#FF00FF',
                    '#FF0000',
                    'white',
                  ]}
                  style={{ width: '100%', height: '100%', borderRadius: 10 }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: sliderMode === 'text' ? textSliderY - 5 : bgSliderY - 5,
                    left: -6,
                    right: -6,
                    height: 10,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: 'black',
                  }}
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
            placeholder={placeholderText}
            placeholderTextColor={
              textBgColor !== 'transparent' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'
            }
            multiline
          />
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  textInputOverlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputHeaderTop: {
    position: 'absolute',
    top: 50,
    right: 20,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  overlayTextInputCenter: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '90%',
    minWidth: 50,
    alignSelf: 'center',
  },
});
