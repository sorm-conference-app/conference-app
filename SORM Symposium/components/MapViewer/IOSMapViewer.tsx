import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';
import { MapViewerProps } from './types';
import { calculateBounds, clamp } from './utils';

export const IOSMapViewer = ({ imageSource, isVisible, onClose }: MapViewerProps) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isVisible) {
      // Reset state when opening
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      setIsLoading(true);
    }
  }, [isVisible]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      scale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = clamp(scale.value * e.scale, 1, 4);
      scale.value = newScale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      translateX.value = translateX.value;
      translateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        const bounds = calculateBounds(scale.value, imageSize, containerSize);
        translateX.value = clamp(e.translationX, bounds.minX, bounds.maxX);
        translateY.value = clamp(e.translationY, bounds.minY, bounds.maxY);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
      }
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Race(
      pinchGesture,
      doubleTapGesture
    ),
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }));

  const handleImageLoad = (event: ImageLoadEventData) => {
    const { width, height } = event.source;
    setImageSize({ width, height });
    setIsLoading(false);
  };

  const handleContainerLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View 
        style={styles.modal}
        onLayout={handleContainerLayout}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Image
              source={imageSource}
              style={styles.image}
              onLoad={handleImageLoad}
              contentFit="contain"
            />
          </Animated.View>
        </GestureDetector>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 