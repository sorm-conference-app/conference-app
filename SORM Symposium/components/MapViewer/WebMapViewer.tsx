import { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image, ImageLoadEventData } from 'expo-image';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';
import { MapViewerProps } from './types';
import { calculateBounds, clamp } from './utils';

export const WebMapViewer = ({ imageSource, isVisible, onClose }: MapViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<View>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isVisible) {
      // Reset state when opening
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
    }
  }, [isVisible]);

  const handleWheel = (e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = clamp(scale * delta, 1, 4);
    setScale(newScale);
  };

  const handleMouseDown = (e: any) => {
    if (scale > 1) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && scale > 1) {
      const bounds = calculateBounds(scale, imageSize, containerSize);
      setPosition(prev => ({
        x: clamp(prev.x + e.movementX, bounds.minX, bounds.maxX),
        y: clamp(prev.y + e.movementY, bounds.minY, bounds.maxY)
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (event: ImageLoadEventData) => {
    const { width, height } = event.source;
    setImageSize({ width, height });
    setIsLoading(false);
  };

  const handleContainerLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  if (!isVisible) return null;

  return (
    <View 
      ref={containerRef}
      style={styles.modal}
      onLayout={handleContainerLayout}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        <Image
          source={imageSource}
          style={[
            styles.image,
            {
              transform: [
                { scale },
                { translateX: position.x },
                { translateY: position.y }
              ]
            }
          ]}
          onLoad={handleImageLoad}
        />
      </div>

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
  );
}; 