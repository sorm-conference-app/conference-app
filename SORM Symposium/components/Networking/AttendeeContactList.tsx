import { StyleSheet, RefreshControl, ScrollView, Pressable, Platform } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAttendeeContacts } from "@/hooks/useAttendeeContacts";
import React from "react";
import { Colors } from "@/constants/Colors";
import ContactRow from "./contactRow";
import { getVerifiedEmails } from "@/lib/attendeeStorage";
import { Attendee, getAttendeeByEmail } from "@/services/attendees";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { useContactSharingModal } from "@/hooks/useContactSharingModal";
import ContactSharingModal from "../ContactSharingModal";

interface AttendeeContactListProps {
  reloadTrigger?: number;
}

export default function AttendeeContactList({ reloadTrigger }: AttendeeContactListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { contacts, loading, error, refresh } = useAttendeeContacts();
  const [attendee, setAttendee] = React.useState<Attendee | null>(null);
  const session = useSupabaseAuth();

  const {
    isVisible: isContactSharingVisible,
    attendee: contactSharingAttendee,
    showModalForce: showContactSharingModal,
    hideModal: hideContactSharingModal,
    savePreferences: saveContactSharingPreferences,
  } = useContactSharingModal();
  
  // Load user's verified email and share_info preference on component mount
  React.useEffect(() => {
    loadUserInfo();
  }, [session]);

  // Refresh contacts when reloadTrigger changes
  React.useEffect(() => {
    if (reloadTrigger) {
      refresh();
    }
  }, [reloadTrigger, refresh]);

  async function loadUserInfo() {
    try {
      const verifiedEmails = await getVerifiedEmails();
      const firstVerifiedEmail = verifiedEmails.length > 0 ? verifiedEmails[0] : null;
      
      // If we have a verified email, fetch the user's share_info preference
      if (firstVerifiedEmail) {
        setAttendee(await getAttendeeByEmail(firstVerifiedEmail));
      } else {
        // If we don't have a verified email, see if the user is logged in as an admin
        // If they are, get their email from their authentication info
        if (session?.user?.email) {
          setAttendee(await getAttendeeByEmail(session.user.email ?? ""));
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }

  const handleContactSharingDontShare = async () => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(false, '');
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    refresh();
  };

  const handleContactSharingShare = async (additionalInfo: string) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(true, additionalInfo);
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    refresh();
  };

  const handleContactSharingClose = () => {
    hideContactSharingModal();
    refresh();
  };

  const disclosureArea = () => {
    return (
      <ThemedView style={{ backgroundColor: "transparent", margin: 5, marginBottom: 0 }}>
        <ThemedText style={styles.subtitle}>These individuals have agreed to share their contact information.</ThemedText>
        <ThemedText style={styles.subtitle}>
          {attendee?.share_info === true ? <ThemedText style={{ fontWeight: "bold" }}>Your contact information is being shared. </ThemedText> 
          : attendee?.share_info === false ? <ThemedText style={{ fontWeight: "bold" }}>Your contact information is not being shared. </ThemedText>
          : "Loading your contact sharing preference... "}
        </ThemedText>
        {attendee !== null && attendee.share_info !== null && <ThemedView style={styles.row}>
          <Pressable 
            onPress={() => { showContactSharingModal(attendee.email ?? ""); }}
            style={[styles.button, { 
              backgroundColor: colorScheme === "dark" ? Colors[colorScheme].background : Colors[colorScheme].secondaryBackgroundColor, 
              borderColor: Colors[colorScheme].tint, 
            }]}
          >
            {attendee !== null && attendee.share_info !== null && (
              <ThemedText style={styles.buttonText}>
                {Platform.OS === "web" ? "Click here" 
                : "Tap here"}
              </ThemedText>
            )}
          </Pressable>
          <ThemedText style={[styles.subtitle, { flexShrink: 1, marginLeft: 5, backgroundColor: "transparent", alignSelf: "flex-start" }]}>
            to manage your contact sharing preferences.
          </ThemedText>
        </ThemedView>}
        <ThemedText style={[styles.subtitle, { fontStyle: "italic" }]}>
          {Platform.OS === "web" ? "Click on an attendee to view more contact information." 
          : "Tap on an attendee to view more contact information."}
        </ThemedText>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error loading contacts: {error.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
    <ThemedView style={[styles.container, { 
        borderColor: Colors[colorScheme].tint,
        backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
      }]}>
      <ScrollView 
        style={[styles.contactList, { 
          backgroundColor: colorScheme === "light" ? Colors[colorScheme].background : Colors[colorScheme].secondaryBackgroundColor, 
          borderColor: Colors[colorScheme].tint, 
        }]}
      >
        <ThemedText style={styles.title}>Attendee Contact List</ThemedText>
        {disclosureArea()}
        {contacts.map((contact) => <ContactRow attendee={contact} key={contact.id} />)}
      </ScrollView>
    </ThemedView>

      <ContactSharingModal
      visible={isContactSharingVisible}
      attendee={contactSharingAttendee}
      onDontShare={handleContactSharingDontShare}
      onShare={handleContactSharingShare}
      onClose={handleContactSharingClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    margin: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginHorizontal: 10,
  },
  column: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "transparent",
  },
  contactList: {
    flex: 1,
    flexGrow: 1,
    margin: 10,
    borderWidth: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    margin: 15,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    textAlign: "center",
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
    marginLeft: 0,
    bottom: 2,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    marginRight: 5,
    lineHeight: 20,
  },
});