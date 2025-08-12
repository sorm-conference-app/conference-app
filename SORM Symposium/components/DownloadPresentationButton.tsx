import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { downloadEventPresentation } from "@/services/events";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { Colors } from "@/constants/Colors";

type DownloadPresentationButtonProps = {
  eventId: number;
};

function DownloadPresentationButton({
  eventId,
}: DownloadPresentationButtonProps) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const colorScheme = useColorScheme() ?? "light";
  async function onPress() {
    if (downloading) return; // Prevent multiple downloads
    setDownloading(true);
    const url = await downloadEventPresentation(eventId);
    if (Platform.OS === "web") {
      // Use the Native DOM APIs to download the file.
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentation.pdf";
      link.click();
    } else {
      // We are on mobile, so we need to use Expo FileSystem to download the file.
      const { uri } = await FileSystem.downloadAsync(
        url,
        FileSystem.documentDirectory + "presentation.pdf",
      );
      await shareAsync(uri);
    }
    setDownloading(false);
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          padding: 8,
          borderRadius: 5,
          borderWidth: 1,
          marginLeft: 16,
          marginTop: 16,
        },
        { backgroundColor: Colors[colorScheme].adminButton },
        { borderColor: Colors[colorScheme].text },
        downloading && { backgroundColor: "#CCCCCC" }, // Gray when downloading
      ]}
    >
      <ThemedText
        style={[
          { color: Colors[colorScheme].adminButtonText },
          { fontWeight: "bold" },
          {
            textAlign: "center",
          },
        ]}
      >
        {downloading ? "Downloading..." : "Download Presentation"}
      </ThemedText>
    </Pressable>
  );
}

export default DownloadPresentationButton;
