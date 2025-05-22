import { StyleSheet, Dimensions } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ExternalLink } from "@/components/ExternalLink";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { Button } from "react-native";
import useExpoPushToken from "@/hooks/useExpoPushToken";

const width = () => Math.min(Dimensions.get("window").width, 500);
const height = () => (width() * 182) / 500;

export default function Index() {
  const expoPushToken = useExpoPushToken();

  async function sendNotification() {
    if (!expoPushToken) {
      console.error("Expo push token is not available.");
      return;
    }
    
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Test Notification",
      body: "This is a test notification.",
      data: { someData: "goes here" },
    };
    
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Notification sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
    });
  }
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        dark: Colors.dark.tint,
        light: Colors.light.tint,
      }}
      headerImage={
        <Image
          source={require("@/assets/images/sorm-logo.png")}
          style={[styles.logoImage, { width: width(), height: height() }]}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the SORM Symposium!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>
          The SORM Symposium will take place August 13-15 in College Station,
          Texas.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>
          Here you will be able to find information on symposium events,
          speakers, and announcements. You can also find more info at{" "}
          <ExternalLink href="https://www.sorm.state.tx.us/continuity-council-events/sorm-symposium/">
            SORM's website
          </ExternalLink>
          .
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.partContainer}>
        <ThemedText>Navigate using the tabs below.</ThemedText>
      </ThemedView>

      <Button onPress={sendNotification} title="Send a notification." />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  partContainer: {
    gap: 8,
    marginBottom: 8,
  },
  logoImage: {
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
