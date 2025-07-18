import { getSponsorLogo } from "@/hooks/useSponsorLogo";
import { showMessage } from "@/lib/alerts";
import { Sponsor } from "@/types/Sponsors.types";
import { Image, Linking, Pressable, StyleSheet } from "react-native";

type SponsorLogoProps = Sponsor & {
  hyperlink?: boolean;
};

function SponsorLogo({ hyperlink = false, ...props }: SponsorLogoProps) {
  const { logo = undefined, width, height } = getSponsorLogo(props);

  const style = [styles.logo, { width, height }];

  function onNavigate() {
    if (!props.website) {
      showMessage("Website is currently unavailable and is coming soon.");
    } else {
      Linking.openURL(props.website);
    }
  }

  if (hyperlink) {
    return (
      <Pressable onPress={onNavigate}>
        <Image source={logo} style={style} />
      </Pressable>
    );
  }

  return <Image source={logo} style={style} />;
}

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default SponsorLogo;
