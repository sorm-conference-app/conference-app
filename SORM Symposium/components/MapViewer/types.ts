import { ImageSource } from 'expo-image';

export interface MapViewerProps {
  imageSource: ImageSource;
  isVisible: boolean;
  onClose: () => void;
  initialScale?: number;
}

export interface MapViewerState {
  scale: number;
  position: {
    x: number;
    y: number;
  };
  isDragging: boolean;
} 