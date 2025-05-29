import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';
import { MapViewerProps } from './types';
import { calculateBounds, clamp } from './utils';

export const AndroidMapViewer = ({ imageSource, isVisible, onClose }: MapViewerProps) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      setIsLoading(true);
    }
  }, [isVisible]);

  // Android-specific gesture configuration
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      scale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = clamp(scale.value * (e.scale * 0.8), 1, 4);
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
        translateX.value = clamp(e.translationX * 0.8, bounds.minX, bounds.maxX);
        translateY.value = clamp(e.translationY * 0.8, bounds.minY, bounds.maxY);
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

  // Android-specific gesture composition
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
      statusBarTranslucent
    >
      <View 
        style={[styles.modal, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}
        onLayout={handleContainerLayout}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Image
              source={imageSource}
              style={[styles.image, { minWidth: '100%', minHeight: '100%' }]}
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

        <View style={[styles.controls, { top: 40 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 