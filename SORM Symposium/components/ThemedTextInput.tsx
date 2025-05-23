import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

type ThemedTextInputProps = TextInputProps;

export default function ThemedTextInput({
  style,
  ...props
}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "tint");

  return (
    <TextInput
      style={[
        {
          backgroundColor,
          padding: 10,
          borderRadius: 5,
          color: textColor,
          borderWidth: 1,
          borderColor,
        },
        style,
      ]}
      placeholderTextColor={textColor}
      {...props}
    />
  );
}
