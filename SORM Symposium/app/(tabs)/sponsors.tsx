import React from "react";
import { StyleSheet, ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { SponsorCard } from "@/components/SponsorCard";
import { getSponsorsByLevel } from "@/lib/sponsors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function Sponsors() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const sponsorGroups = getSponsorsByLevel();

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Ultra-Resilient":
        return "#FFD700"; // Gold
      case "Resilient":
        return "#C0C0C0"; // Silver
      case "TBD":
        return "#CD7F32"; // Bronze
      default:
        return colors.text;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Sponsors",
          headerShown: true,
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Symposium Sponsors
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Thank you to our generous sponsors for supporting this event
            </Text>
          </View>

          {sponsorGroups.map((group) => (
            <View key={group.level} style={styles.groupContainer}>
              <View
                style={[
                  styles.levelHeader,
                  { backgroundColor: getLevelColor(group.level) },
                ]}
              >
                <Text style={styles.levelTitle}>{group.level} Sponsors</Text>
                <Text style={styles.sponsorCount}>
                  {group.sponsors.length} sponsor
                  {group.sponsors.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {group.sponsors.length > 0 ? (
                group.sponsors.map((sponsor) => (
                  <SponsorCard key={sponsor.id} sponsor={sponsor} />
                ))
              ) : (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: colors.secondaryBackgroundColor },
                  ]}
                >
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    No {group.level} sponsors yet
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  groupContainer: {
    marginTop: 20,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  sponsorCount: {
    fontSize: 14,
    color: "#000",
    opacity: 0.8,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
