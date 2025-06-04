import React from 'react';
import { Modal, Pressable, View, StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type AlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose: () => void;
};

export function AlertModal({ visible, title, message, buttons, onClose }: AlertModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <ThemedView 
          style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme].background }
          ]}
        >
          <ThemedText type="subtitle" style={styles.modalTitle}>{title}</ThemedText>
          <ThemedText style={styles.modalMessage}>{message}</ThemedText>
          <View style={styles.modalButtons}>
            {buttons.map((button) => (
              <Button
                key={button.text}
                title={button.text}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
                color={button.style === 'destructive' ? 'red' : undefined}
              />
            ))}
          </View>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalMessage: {
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
}); 