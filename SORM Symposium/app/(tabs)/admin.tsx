import { AgendaEditor } from "@/components/AgendaViewer/AgendaEditor";
import AnnouncementForm from "@/components/AnnouncementForm";
import ContactEditForm from "@/components/ContactEditForm";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useActiveUserCount from "@/hooks/useActiveUserCount";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Redirect } from "expo-router";
import React, { useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, ViewStyle } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Component to display user statistics in a visually appealing card format
 */
function UserStatsSection({ activeUsers }: { activeUsers: Record<string, number> }) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <ThemedView style={[
      styles.statsContainer,
      { 
        backgroundColor: Colors[colorScheme].background,
        borderColor: Colors[colorScheme].tint 
      }
    ]}>
      {/* Header section */}
      <View style={styles.statsHeader}>
        <ThemedText type="title" style={styles.welcomeTitle}>
          Admin Panel
        </ThemedText>
        <ThemedText type="subtitle" style={styles.statsSubtitle}>
          Active Users Overview
        </ThemedText>
      </View>
      
      {/* Stats cards section */}
      <View style={styles.statsGrid}>
        {Object.entries(activeUsers).map(([platform, count]) => (
          <ThemedView 
            key={platform}
            style={[
              styles.statCard,
              { 
                backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                borderColor: Colors[colorScheme].tint 
              }
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.platformName}>
              {/* Specially handle 'ios' platform by displaying 'iOS' instead of 'Ios' */}
              {platform.toLowerCase() === 'ios' ? 'iOS' : capitalize(platform)}
            </ThemedText>
            <ThemedText type="title" style={styles.userCount}>
              {count}
            </ThemedText>
            <ThemedText style={styles.userLabel}>
              {count === 1 ? 'user' : 'users'}
            </ThemedText>
          </ThemedView>
        ))}
      </View>
    </ThemedView>
  );
}

export default function Admin() {
  const activeUsers = useActiveUserCount();
  const user = useSupabaseAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const agendaEditorRef = useRef<View>(null);

  if (!user) {
    return <Redirect href="/(tabs)" />;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView>
          <UserStatsSection activeUsers={activeUsers} />
          <AnnouncementForm />
          <ContactEditForm />
          <View ref={agendaEditorRef}>
            <AgendaEditor onShowForm={scrollToAgendaEditor} onCloseForm={scrollToEvent} />
          </View>
        </ThemedView>
      </ScrollView>
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
  // User stats section styles
  statsContainer: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  } as ViewStyle,
  statsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 4,
  } as ViewStyle,
  welcomeTitle: {
    marginBottom: 4,
  } as ViewStyle,
  statsSubtitle: {
    opacity: 0.8,
  } as ViewStyle,
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  } as ViewStyle,
  statCard: {
    flex: 1,
    minWidth: 120,
    maxWidth: 150,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  } as ViewStyle,
  platformName: {
    fontSize: 14,
    textAlign: 'center',
  } as ViewStyle,
  userCount: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 2,
  } as ViewStyle,
  userLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  } as ViewStyle,
});
