import { Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "../ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { Colors } from "@/constants/Colors";

type AgendaItemSaveButtonProps = {
  isRSVP: boolean;
};

function AgendaItemSaveButton({ isRSVP }: AgendaItemSaveButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  let iconName = "star";

  if (isRSVP) {
    iconName += ".fill";
  }

  function handleSave() {
    // ...
  }

  return (
    <Pressable onPress={handleSave}>
      <IconSymbol
        name={iconName as IconSymbolName}
        size={20}
        color={tintColor}
      />
    </Pressable>
  );
}

export default AgendaItemSaveButton;
