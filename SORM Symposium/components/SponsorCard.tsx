import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Sponsor } from "@/types/Sponsors.types";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface SponsorCardProps {
  sponsor: Sponsor;
}

export const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor }) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

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
    <View
      style={[
        styles.card,
        { backgroundColor: colors.secondaryBackgroundColor },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {sponsor.logo ? (
            <Image source={{ uri: sponsor.logo }} style={styles.logo} />
          ) : (
            <View
              style={[styles.placeholderLogo, { backgroundColor: colors.tint }]}
            >
              <Text
                style={[styles.placeholderText, { color: colors.background }]}
              >
                {sponsor.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { color: colors.text }]}>
            {sponsor.name}
          </Text>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: getLevelColor(sponsor.level) },
            ]}
          >
            <Text style={styles.levelText}>{sponsor.level}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.text }]}>
        {sponsor.description}
      </Text>

      <View style={styles.contactContainer}>
        <Text style={[styles.contactLabel, { color: colors.text }]}>
          Contact:
        </Text>
        <Text style={[styles.contactInfo, { color: colors.link }]}>
          {sponsor.contactInfo}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  levelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  contactInfo: {
    fontSize: 14,
    flex: 1,
  },
});
