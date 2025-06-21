import { Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "../ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { Colors } from "@/constants/Colors";
import { toggleRSVPStatus } from "@/services/events";
import { getDeviceId } from "@/lib/user";
import { Dispatch, SetStateAction } from "react";

type AgendaItemSaveButtonProps = {
  eventId: number;
  isRSVP: boolean;
  setRsvpEventIds: Dispatch<SetStateAction<Set<number>>>;
};

function AgendaItemSaveButton({
  isRSVP,
  eventId,
  setRsvpEventIds,
}: AgendaItemSaveButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  let iconName = "star";

  if (isRSVP) {
    iconName += ".fill";
  }

  async function handleSave() {
    const deviceId = await getDeviceId();
    const isRSVPing = !isRSVP;
    await toggleRSVPStatus(eventId, deviceId, isRSVPing);

    // Update the status in the UI.
    setRsvpEventIds((prev) => {
      const newSet = new Set(prev);
      if (isRSVPing) {
        newSet.add(eventId);
      } else {
        newSet.delete(eventId);
      }

      return newSet;
    });
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
