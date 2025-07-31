import { ReactNode } from "react";
import logo from "@/assets/images/sorm-logo.png";
import ParallaxScrollView from "./ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import { Image, Dimensions, StyleSheet, Linking } from "react-native";

const SORM_URL = "https://www.sorm.state.tx.us/";

export default function SormImageWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const width = Math.min(Dimensions.get("window").width, 500);
  const height = (width * 182) / 500;

  function onImagePress() {
    Linking.openURL(SORM_URL);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        dark: Colors.dark.tint,
        light: Colors.light.secondaryBackgroundColor,
      }}
      headerImage={
        <Image
          source={logo}
          style={[styles.logo, { width, height }]}
          alt="SORM Logo"
        />
      }
      onImagePress={onImagePress}
    >
      {children}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    bottom: 0,
    position: "absolute",
    left: 0,
  },
});
