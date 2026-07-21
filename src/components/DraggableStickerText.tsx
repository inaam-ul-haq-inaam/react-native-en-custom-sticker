import React, { useRef } from 'react';
import { Animated, Text } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

export interface StickerTextData {
  id: string;
  text: string;
  color: string;
  bgColor: string;
}

interface Props {
  item: StickerTextData;
  onPress: () => void;
  isEditing: boolean;
}

export const DraggableStickerText = ({ item, onPress, isEditing }: Props) => {
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
