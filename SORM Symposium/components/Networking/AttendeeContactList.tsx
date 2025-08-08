import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useAttendeeContacts } from "@/hooks/useAttendeeContacts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useContactSharingModal } from "@/hooks/useContactSharingModal";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { Attendee, getAttendeeByContact, getAttendeeByEmail } from "@/services/attendees";
import React, { useCallback } from "react";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import ContactRow from "./contactRow";
import ContactSharingModal from "./ContactSharingModal";

interface AttendeeContactListProps {
  reloadTrigger?: number;
}

export default function AttendeeContactList({ reloadTrigger }: AttendeeContactListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { contacts, error, refresh } = useAttendeeContacts();
  const [attendee, setAttendee] = React.useState<Attendee | null>(null);
  const [expandedRowId, setExpandedRowId] = React.useState<number | null>(null);
  const session = useSupabaseAuth();

  const {
    isVisible: isContactSharingVisible,
    attendee: contactSharingAttendee,
    showModalForce: showContactSharingModal,
    hideModal: hideContactSharingModal,
    savePreferences: saveContactSharingPreferences,
  } = useContactSharingModal();
  
  const loadUserInfo = useCallback(async () => {
    try {
      // Prefer to resolve attendee by email (session email or persisted attendee_email metadata)
      const metaEmail = (session?.user?.user_metadata as any)?.attendee_email as string | undefined;
      const email = metaEmail || session?.user?.email;
      const phone = session?.user?.phone;

      if (email) {
        setAttendee(await getAttendeeByEmail(email));
      } else if (phone) {
        setAttendee(await getAttendeeByContact(phone));
      } else {
        setAttendee(null);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }, [session]);

  // Load user's verified email and share_info preference on component mount
  React.useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // Set up real-time subscription for current user's attendee record
  React.useEffect(() => {
    if (!attendee?.id) return;

    //console.log('Setting up real-time subscription for user ID:', attendee.id);
    
    const channel = supabase
      .channel(`user_attendee_${attendee.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'attendee_info',
          filter: `id=eq.${attendee.id}`
        }, 
        (payload: any) => {
          //console.log('User attendee record updated:', payload);
          // Reload user's info when their record changes
          loadUserInfo();
        }
      )
      .subscribe((status: any) => {
        //console.log('User attendee subscription status:', status);
      });
    
    // Cleanup function
    return () => {
      //console.log('Cleaning up user attendee subscription');
      supabase.removeChannel(channel);
    };
  }, [attendee?.id, loadUserInfo]);

  // Refresh contacts when reloadTrigger changes
  React.useEffect(() => {
    if (reloadTrigger) {
      refresh();
      loadUserInfo(); // Also reload the current user's info
    }
  }, [reloadTrigger, refresh, loadUserInfo]);

  const handleContactSharingDontShare = async (additionalInfo: string, name?: string, organization?: string, title?: string) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(false, additionalInfo, name, organization, title);
      await loadUserInfo(); // Reload user's info to update the status text
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    refresh();
  };

  const handleContactSharingShare = async (additionalInfo: string, name?: string, organization?: string, title?: string) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(true, additionalInfo, name, organization, title);
      await loadUserInfo(); // Reload user's info to update the status text
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
        <ThemedText type="default" style={styles.subtitle}>These individuals have agreed to share their contact information.</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
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
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                {Platform.OS === "web" ? "Click here" 
                : "Tap here"}
              </ThemedText>
            )}
          </Pressable>
          <ThemedText type="default" style={[styles.subtitle, { flexShrink: 1, marginLeft: 5, backgroundColor: "transparent", alignSelf: "flex-start" }]}>
            to manage your contact sharing preferences.
          </ThemedText>
        </ThemedView>}
        <ThemedText type="default" style={[styles.subtitle, { fontStyle: "italic" }]}>
          {Platform.OS === "web" ? "Click on an attendee to view more contact information." 
          : "Tap on an attendee to view more contact information."}
        </ThemedText>
      </ThemedView>
    )
  }

  // Function to close all expanded rows
  const closeAllExpandedRows = () => {
    setExpandedRowId(null);
  };

  // Function to set a specific row as expanded
  const setExpandedRow = (rowId: number | null) => {
    setExpandedRowId(rowId);
  };

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
        <Pressable onPress={closeAllExpandedRows} style={{ flex: 1 }}>
          <ThemedText type="title" style={styles.title}>Attendee Contact List</ThemedText>
          {disclosureArea()}
          {contacts.map((contact) => (
            <ContactRow 
              attendee={contact} 
              key={contact.id} 
              expandedRowId={expandedRowId}
              setExpandedRow={setExpandedRow}
            />
          ))}
        </Pressable>
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
    margin: 15,
  },
  subtitle: {
    textAlign: "center",
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
    marginLeft: 5,
    marginRight: 5,
    lineHeight: 20,
  },
});