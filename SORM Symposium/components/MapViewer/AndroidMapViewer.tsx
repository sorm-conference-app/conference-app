import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { Gesture, GestureDetector, gestureHandlerRootHOC, GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const baseScale = useSharedValue(1);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);
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
      'worklet';
      // Store the current scale as our base for this pinch operation
      baseScale.value = scale.value;
    })
    .onUpdate((e) => {
      'worklet';
      try {
        // Calculate new scale based on the base scale and gesture scale
        scale.value = clamp(baseScale.value * e.scale, 1, 4); // Clamp the value between 1 and 4
      } catch (error) {
        scale.value = baseScale.value;
      }
    })
    .onEnd(() => {
      'worklet';
      // Apply spring animation when the gesture ends
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else {
        scale.value = withSpring(scale.value);
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Store the current translation values as our base for this pan operation
      baseTranslateX.value = translateX.value;
      baseTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (scale.value > 1) {
        try {
          // Calculate the translation based on the current scale and bounds
          const bounds = calculateBounds(scale.value, imageSize, containerSize);
          translateX.value = clamp(baseTranslateX.value + (e.translationX / scale.value), bounds.minX, bounds.maxX);
          translateY.value = clamp(baseTranslateY.value + (e.translationY / scale.value), bounds.minY, bounds.maxY);
        } catch (error) {
          // Reset to safe values if something goes wrong
          translateX.value = withSpring(baseTranslateX.value);
          translateY.value = withSpring(baseTranslateY.value);
        }
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        translateX.value = withSpring(translateX.value);
        translateY.value = withSpring(translateY.value);
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      'worklet';
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
      <GestureHandlerRootView style={{ flex: 1 }}>
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
      </GestureHandlerRootView>
    </Modal>
  );
}; 