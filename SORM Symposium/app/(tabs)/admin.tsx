import AnnouncementForm from "@/components/AnnouncementForm";
import { AgendaEditor } from "@/components/AgendaViewer/AgendaEditor";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Redirect } from "expo-router";
import { useState, useRef } from "react";
import { Button, SafeAreaView, ScrollView, StyleSheet, ViewStyle, View } from "react-native";

const TEMPORARY_PIN = "1234";

export default function Admin() {
  const [pin, setPin] = useState<string>("");
  const user = useSupabaseAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const agendaEditorRef = useRef<View>(null);

  function handlePinChange(text: string) {
    setPin(text);
  }

  function resetPin() {
    setPin("");
  }

  if (!user) {
    return <Redirect href="/(tabs)/agenda" />;
  }

  const scrollToAgendaEditor = () => {
    if (scrollViewRef.current) {
      agendaEditorRef.current?.measure((x, y, width, height, pageX, pageY) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: y, animated: true });
        }
      });
    }
  };

  const scrollToEvent = (eventY: number) => {
    if (eventY === 0) return;
    if (agendaEditorRef.current) {
        agendaEditorRef.current.measure((x, y, width, height, pageX, pageY) => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y + eventY, animated: true });
          }
        });
      }
  };

  if (pin === TEMPORARY_PIN) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView>
            <ThemedText>Welcome to the admin panel!</ThemedText>
            <AnnouncementForm />
            <View ref={agendaEditorRef}>
              <AgendaEditor onShowForm={scrollToAgendaEditor} onCloseForm={scrollToEvent} />
            </View>
            <Button onPress={resetPin} title="Go back" />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView>
        <ThemedTextInput
          value={pin}
          onChangeText={handlePinChange}
          placeholder="Enter PIN"
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
  } as ViewStyle,
});
