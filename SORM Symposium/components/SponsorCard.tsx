import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Sponsor } from "@/types/Sponsors.types";
import React from "react";
import { Image, Linking, StyleSheet, Text, View } from "react-native";
import { getSponsorLogo } from "@/hooks/useSponsorLogo";

interface SponsorCardProps {
  sponsor: Sponsor;
}

const handleEmail = (email: string) => {
  Linking.openURL(`mailto:${email}`);
};

const handleWebsite = (website: string | undefined) => {
  if (website) {
    Linking.openURL(website);
  }
};

export const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor }) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { logo, width, height } = getSponsorLogo(sponsor);

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
          {logo ? (
            <Image source={ logo } style={{ width, height }} />
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

      {sponsor.contactInfo && sponsor.contactInfo.length > 0 && (
      <View style={styles.contactContainer}>
        <Text style={[styles.contactLabel, { color: colors.text }]}>
          Contact:
        </Text>
        <View style={styles.contactInfoContainer}>
        {sponsor.contactInfo.map((contact) => (
          <View key={contact.name} style={styles.contactRow}>
            <Text style={styles.contactInfo}>{contact.name}:{contact.phone && `   ${contact.phone}`}{contact.email && `   `}</Text>
            {contact.email !== "" && <Text
              style={[styles.contactInfo, { color: colors.link }]}
              onPress={() => handleEmail(contact.email)}
            >
              {contact.email}
            </Text>}
          </View>
          ))}
        </View>
      </View>
      )}

      <View style={styles.contactContainer}>
        <Text style={[styles.contactLabel, { color: colors.text }]}>
          Website:
        </Text>
        {sponsor.website && (
          <View style={styles.contactRow}>
          <Text style={[styles.contactInfo, { color: colors.link }]}
            onPress={() => handleWebsite(sponsor.website)}
          >
            {sponsor.website}
          </Text>
          </View>
        )}
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
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logoContainer: {
    marginRight: 12,
    marginBottom: 8,
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
    minWidth: 300,
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
    marginBottom: 4,
  },
  contactInfoContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 0,
  },
  contactContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "transparent",
    marginLeft: 65,
    alignItems: "flex-start",
    width: "100%",
  },
  contactLabel: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
  },
  contactInfo: {
    fontSize: 14,
    flexShrink: 1,
    marginBottom: 4,
  },
});
