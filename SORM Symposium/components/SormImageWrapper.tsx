import { ReactNode } from "react";
import logo from "@/assets/images/sorm-logo.png";
import ParallaxScrollView from "./ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import { Image, Dimensions } from "react-native";

export default function SormImageWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const width = Math.min(Dimensions.get('window').width, 500);
  const height = (width * 182) / 500;
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        dark: Colors.dark.tint,
        light: Colors.light.secondaryBackgroundColor,
      }}
      headerImage={
        <Image
          source={logo}
          style={{ width, height }}
          alt="SORM Logo"
        />
      }
    >
      {children}
    </ParallaxScrollView>
  );
}
