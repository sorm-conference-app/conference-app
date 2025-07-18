import { SponsorCard } from "@/components/SponsorCard";
import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getSponsorsByLevel } from "@/lib/sponsors";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Sponsors() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const sponsorGroups = getSponsorsByLevel();
  const bottomTabHeight = useBottomTabOverflow();

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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 20 + bottomTabHeight },
          ]}
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
            group.sponsors.length > 0 && (
            <>
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
                  {group.sponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                  ))}
              </View>
            </>
            )
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
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
