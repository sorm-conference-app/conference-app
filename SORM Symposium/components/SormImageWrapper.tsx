import logo from "@/assets/images/sorm-logo.png";
import { Colors } from "@/constants/Colors";
import { ReactNode, useEffect, useState } from "react";
import { Dimensions, Image, Linking, Platform, StyleSheet } from "react-native";
import ParallaxScrollView from "./ParallaxScrollView";

const SORM_URL = "https://www.sorm.state.tx.us/";

export default function SormImageWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const width = Math.min(Dimensions.get("window").width, 500);
  const height = (width * 182) / 500;

  // Ensure component is hydrated before showing animated parallax on web
  // This prevents the logo from being hidden on static export first load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function onImagePress() {
    Linking.openURL(SORM_URL);
  }

  // On web static export, show a simple non-animated header until hydrated
  // to ensure the logo appears immediately on first load
  if (Platform.OS === "web" && !isMounted) {
    return (
      <div style={{ flex: 1, backgroundColor: Colors.light.secondaryBackgroundColor }}>
        <div
          style={{
            height: 250,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            backgroundColor: Colors.light.secondaryBackgroundColor,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer"
          }}
          onClick={onImagePress}
        >
          <img
            src={logo}
            alt="SORM Logo"
            style={{
              width,
              height,
              position: "absolute",
              bottom: 0,
              left: 0,
            }}
          />
        </div>
        <div style={{ flex: 1, padding: 32, backgroundColor: Colors.light.background }}>
          {children}
        </div>
      </div>
    );
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
