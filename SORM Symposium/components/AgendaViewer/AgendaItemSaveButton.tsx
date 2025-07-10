import { Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "../ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { Colors } from "@/constants/Colors";
import { toggleRSVPStatus } from "@/services/events";
import { getDeviceId } from "@/lib/user";
import { useState } from "react";

type AgendaItemSaveButtonProps = {
  eventId: number;
  isRSVP: boolean;
  setRsvpEventIds: () => void; // Changed to simple function that triggers refetch
};

function AgendaItemSaveButton({
  isRSVP,
  eventId,
  setRsvpEventIds,
}: AgendaItemSaveButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const [isLoading, setIsLoading] = useState(false);
  let iconName = "star";

  if (isRSVP) {
    iconName += ".fill";
  }

  async function handleSave() {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    const deviceId = await getDeviceId();
    const isRSVPing = !isRSVP;
    
    try {
      await toggleRSVPStatus(eventId, deviceId, isRSVPing);

      // Trigger refetch to update the UI with latest data
      // The real-time subscription will handle the UI update automatically
      setRsvpEventIds();
    } catch (e) {
      console.error(
        "Couldn't update save status for event with id " +
          eventId +
          ". Reason: " +
          (e as Error).message,
      );
      
      // The real-time subscription should handle UI updates automatically
      // If there's an error, it will be reflected in the UI state
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Pressable onPress={handleSave} disabled={isLoading}>
      <IconSymbol
        name={iconName as IconSymbolName}
        size={20}
        color={isLoading ? Colors[colorScheme].text + "40" : tintColor} // Dimmed when loading
      />
    </Pressable>
  );
}

export default AgendaItemSaveButton;
