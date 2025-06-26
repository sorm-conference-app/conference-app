import { StyleSheet, RefreshControl, ScrollView, Pressable, Platform } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAttendeeContacts } from "@/hooks/useAttendeeContacts";
import React from "react";
import { Colors } from "@/constants/Colors";
import ContactRow from "./contactRow";
import { getVerifiedEmails } from "@/lib/attendeeStorage";
import { getAttendeeByEmail } from "@/services/attendees";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";

interface AttendeeContactListProps {
  reloadTrigger?: number;
}

export default function AttendeeContactList({ reloadTrigger }: AttendeeContactListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { contacts, loading, error, refresh } = useAttendeeContacts();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userShareInfo, setUserShareInfo] = React.useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const session = useSupabaseAuth();

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
      setUserEmail(firstVerifiedEmail);
      
      let attendee;
      // If we have a verified email, fetch the user's share_info preference
      if (firstVerifiedEmail) {
        attendee = await getAttendeeByEmail(firstVerifiedEmail);
      } else {
        // If we don't have a verified email, see if the user is logged in as an admin
        // If they are, get their email from their authentication info
        if (session?.user?.email) {
          setUserEmail(session.user.email ?? null);
          attendee = await getAttendeeByEmail(userEmail ?? "");
        }
      }
      setIsAdmin(attendee?.is_admin ?? false);
      setUserShareInfo(attendee?.share_info ?? null); // Set the user's share_info preference
    } catch (error) {
      console.error('Error loading user info:', error);
      setUserEmail(null);
      setUserShareInfo(null);
      setIsAdmin(false);
    }
  }

  const disclosureArea = () => {
    return (
      <ThemedView style={{ backgroundColor: "transparent", margin: 5, marginBottom: 0 }}>
        <ThemedText style={styles.subtitle}>These individuals have agreed to share their contact information.</ThemedText>
        <ThemedText style={styles.subtitle}>
          {userShareInfo === true ? <ThemedText style={{ fontWeight: "bold" }}>Your contact information is being shared. </ThemedText> 
          : userShareInfo === false ? <ThemedText style={{ fontWeight: "bold" }}>Your contact information is not being shared. </ThemedText>
          : "Loading your contact sharing preference... "}
        </ThemedText>
        {userEmail !== null && userShareInfo !== null && <ThemedView style={styles.row}>
          <Pressable 
            onPress={() => { setUserShareInfo(!userShareInfo); /* TODO: Add a modal to change the user's contact sharing preference */ }}
            style={[styles.button, { 
              backgroundColor: Colors[colorScheme].secondaryBackgroundColor, 
              borderColor: Colors[colorScheme].tint, 
            }]}
          >
            {userEmail !== null && userShareInfo !== null && (
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