import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  modal: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
      },
      default: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
      }
    })
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    ...Platform.select({
      android: {
        // Ensure the image is properly rendered on Android
        minWidth: '100%',
        minHeight: '100%',
      }
    })
  },
  controls: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
    right: 20,
    zIndex: 1001,
    flexDirection: 'row',
    gap: 10,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
}); 