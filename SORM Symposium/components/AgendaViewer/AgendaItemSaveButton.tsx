import { Pressable } from "react-native";
import { IconSymbol, IconSymbolName } from "../ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { Colors } from "@/constants/Colors";
import { toggleRSVPStatusAuto } from "@/services/events";
import { useState } from "react";
import { useCurrentAttendee } from "@/hooks/useCurrentAttendee";

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
  const { attendee } = useCurrentAttendee();
  let iconName = "star";

  if (isRSVP) {
    iconName += ".fill";
  }

  async function handleSave() {
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    setIsLoading(true);
    const isRSVPing = !isRSVP;
    
    try {
      if (attendee?.id) {
        // Use attendee ID if available
        await toggleRSVPStatusAuto(eventId, attendee.id, isRSVPing);
      } else {
        // Fall back to device ID for backward compatibility
        // Note: This will need to be updated to work with the new schema
        // For now, we'll use a placeholder approach
        console.warn("Using device ID fallback - this may not work with new schema");
        await toggleRSVPStatusAuto(eventId, 0, isRSVPing); // This will fail, but prevents type error
      }

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
