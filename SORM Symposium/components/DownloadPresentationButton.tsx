import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./ThemedText";
import { downloadEventPresentation } from "@/services/events";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { Colors } from "@/constants/Colors";

function DownloadPresentationButton({}) {
  const [downloading, setDownloading] = useState<boolean>(false);
  const colorScheme = useColorScheme() ?? 'light';
  async function onPress() {
    if (downloading) return; // Prevent multiple downloads
    setDownloading(true);
    const url = await downloadEventPresentation("");
    if (Platform.OS === "web") {
      // A blob was returned, indicating that we are on web.
      // Use the Native DOM APIs to download the file.
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentation.pdf";
      link.click();
    } else {
      // We are on mobile, so we need to use Expo FileSystem to download the file.
      // const perms =
      //   await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      // if (!perms.granted) {
      //   console.error("Storage permissions not granted");
      //   return;
      // }
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
      style={(state) => [
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
      <ThemedText style={[
        { color: Colors[colorScheme].adminButtonText },
        { fontWeight: "bold" },
      ]}>
        {downloading ? "Downloading..." : "Download Presentation"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DownloadPresentationButton;
