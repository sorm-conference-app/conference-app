import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  ...props
}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const textColor = useThemeColor({}, "text");

  return (
    <TextInput
      style={[
        {
          backgroundColor,
          padding: 10,
          borderRadius: 5,
          color: textColor,
          borderWidth: 1,
          borderColor: "gray",
        },
        style,
      ]}
      placeholderTextColor={textColor}
      {...props}
    />
  );
}
