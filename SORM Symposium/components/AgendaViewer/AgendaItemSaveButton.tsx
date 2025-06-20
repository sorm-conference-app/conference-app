import { Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "../ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme.web";

function AgendaItemSaveButton() {
  const tintColor = useColorScheme() ?? "light";
  let iconName = "star";

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
