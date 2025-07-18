import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getSponsorLogo } from "@/hooks/useSponsorLogo";
import { Sponsor } from "@/types/Sponsors.types";
import React from "react";
import { Image, Linking, StyleSheet } from "react-native";

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
    <ThemedView
      style={[
        styles.card,
        { backgroundColor: colors.secondaryBackgroundColor },
      ]}
    >
      <ThemedView style={[styles.header, { backgroundColor: 'transparent' }]}>
        <ThemedView style={[styles.logoContainer, { backgroundColor: logo ? Colors.light.background : 'transparent'}]}>
          {logo ? (
            <Image source={logo} style={{ width, height }} />
          ) : (
            <ThemedView
              style={[styles.placeholderLogo, { backgroundColor: colors.tint }]}
            >
              <ThemedText
                style={[styles.placeholderText, { color: colors.background }]}
              >
                {sponsor.name.charAt(0)}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        <ThemedView style={[styles.titleContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.name, { color: colors.text }]}>
            {sponsor.name}
          </ThemedText>
          <ThemedView
            style={[
              styles.levelBadge,
              { backgroundColor: getLevelColor(sponsor.level) },
            ]}
          >
            <ThemedText style={styles.levelText}>{sponsor.level}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedText style={[styles.description, { color: colors.text }]}>
        {sponsor.description}
      </ThemedText>

      {sponsor.contactInfo && sponsor.contactInfo.length > 0 && (
        <ThemedView style={[styles.contactContainer, { backgroundColor: 'transparent' }]}>
          <ThemedText style={[styles.contactLabel, { color: colors.text }]}>
            Contact:
          </ThemedText>
          <ThemedView style={[styles.contactInfoContainer, { backgroundColor: 'transparent' }]}>
            {sponsor.contactInfo.map((contact) => (
              <ThemedView key={contact.name} style={[styles.contactRow, { backgroundColor: 'transparent' }]}>
                <ThemedText style={[styles.contactInfo]}>
                  {contact.name}
                  {contact.phone ? `: ${contact.phone}` : ""}
                </ThemedText>
                {contact.email !== "" && (
                  <ThemedText
                    style={[styles.contactInfo, { color: colors.link }]}
                    onPress={() => handleEmail(contact.email)}
                    type="link"
                  >
                    {contact.email}
                  </ThemedText>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      )}

      {sponsor.website !== "" && ( <ThemedView style={[styles.contactContainer, { backgroundColor: 'transparent' }]}>
        <ThemedText style={[styles.contactLabel, { color: colors.text }]}>
          Website:
        </ThemedText>
          <ThemedView style={[styles.contactRow, { backgroundColor: 'transparent' }]}>
            <ThemedText
              style={[styles.contactInfo, { color: colors.link }]}
              onPress={() => handleWebsite(sponsor.website)}
              type="link"
            >
              {sponsor.website}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
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
    borderRadius: 8,
    padding: 8,
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
    flex: 1,
  },
  contactContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  contactRow: {
    flexDirection: "column",
    backgroundColor: "transparent",
    marginLeft: 65,
    alignItems: "flex-start",
    marginTop: 4,
  },
  contactLabel: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
    alignItems: "baseline",
  },
  contactInfo: {
    fontSize: 14,
    flexShrink: 1,
    marginBottom: 4,
    lineHeight: 18,
  },
});
