import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

type ThemedTextInputProps = TextInputProps & {
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function ThemedTextInput({
  style,
  accessibilityLabel,
  accessibilityHint,
  placeholder,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <TextInput
      style={[
        {
          backgroundColor: Colors[colorScheme].background,
          padding: 10,
          borderRadius: 5,
          color: Colors[colorScheme].text,
          borderWidth: 1,
          borderColor: Colors[colorScheme].tint,
        },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={Colors[colorScheme].tabIconDefault}
      accessibilityLabel={accessibilityLabel || placeholder}
      accessibilityHint={accessibilityHint}
      accessibilityRole="text"
      {...props}
    />
  );
}
