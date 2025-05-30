import { Platform } from 'react-native';
import { WebMapViewer } from './WebMapViewer';
import { MapViewerProps } from './types';
import { IOSMapViewer } from './IOSMapViewer';
import { AndroidMapViewer } from './AndroidMapViewer';

export const MapViewer = (props: MapViewerProps) => {
  return Platform.OS === 'web' 
    ? <WebMapViewer {...props} />
    : Platform.OS === 'ios' 
      ? <IOSMapViewer {...props} />
      : <AndroidMapViewer {...props} />;
}; 