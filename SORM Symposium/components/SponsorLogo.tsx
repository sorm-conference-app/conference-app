import { getSponsorLogo } from "@/hooks/useSponsorLogo";
import { showMessage } from "@/lib/alerts";
import { Sponsor } from "@/types/Sponsors.types";
import { Image, Linking, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

type SponsorLogoProps = Sponsor & {
  hyperlink?: boolean;
  style?: StyleProp<ViewStyle>;
};

function SponsorLogo({ hyperlink = false, style, ...props }: SponsorLogoProps) {
  const { logo = undefined, width, height } = getSponsorLogo(props);

  const imageStyle = [styles.logo, { width, height }];

  function onNavigate() {
    if (!props.website) {
      showMessage("Website is currently unavailable and is coming soon.");
    } else {
      Linking.openURL(props.website);
    }
  }

  if (hyperlink) {
    return (
      <Pressable onPress={onNavigate} style={style}>
        <Image source={logo} style={imageStyle} />
      </Pressable>
    );
  }

  return <Image source={logo} style={imageStyle} />;
}

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
  },
});

export default SponsorLogo;
