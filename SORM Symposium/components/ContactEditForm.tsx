import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tables } from "@/types/Supabase.types";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";
import { ThemedView } from "./ThemedView";
import ConfirmEditEmailModal from "./ConfirmEditEmailModal";
import { showSuccessMessage, showErrorMessage } from "@/lib/alerts";

function handleString(str: string | null): string {
  if (str === null) {
    return "";
  }
  return str;
}

/**
 * Form for editing existing contact information in Supabase.
 * Allows selection of a contact, editing their info, and updating in the database.
 * @returns JSX.Element
 */
export default function ContactEditForm() {
  // State for all contacts
  const [contacts, setContacts] = useState<Tables<'contact_info'>[]>([]);
  const [attendees, setAttendees] = useState<Tables<'attendee_info'>[]>([]);
  // State for selected contact id (use empty string for web compatibility)
  const [selectedId, setSelectedId] = useState<number | string>("");
  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [disabled, setDisabled] = useState(true);
  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  // State for editing attendee info
  const [editingAttendee, setEditingAttendee] = useState(false);

  // State for showing confirm edit email modal
  const [showConfirmEditEmailModal, setShowConfirmEditEmailModal] = useState(false);

  // Get current color scheme for theming
  const colorScheme = useColorScheme() ?? 'light';

  // Fetch all contacts on mount
  useEffect(() => {
    async function fetchContacts() {
      setFetching(true);
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });
      if (error) {
        showErrorMessage("Error fetching contacts: " + error.message);
        setContacts([]);
      } else {
        setContacts(data || []);
      }
      setFetching(false);
    }
    fetchContacts();
  }, []);

  useEffect(() => {
    async function fetchAttendees() {
      const { data, error } = await supabase
        .from("attendee_info")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        showErrorMessage("Error fetching attendees: " + error.message);
        setAttendees([]);
      } else {
        setAttendees(data || []);
      }
    }
    fetchAttendees();
  }, []);

  // When a contact is selected, always prefill the form fields
  useEffect(() => {
    if (editingAttendee) {
      if (selectedId !== "" && typeof selectedId === "number") {
        const attendee = attendees.find(a => a.id === selectedId);
        if (attendee) {
          setAttendeeName(handleString(attendee.name));
          setEmail(handleString(attendee.email));
        }
      } else {
        setAttendeeName("");
        setEmail("");
      }
    } else {
      if (selectedId !== "" && typeof selectedId === "number") {
        const contact = contacts.find(c => c.id === selectedId);
        if (contact) {
          setFirstName(handleString(contact.first_name));
          setLastName(handleString(contact.last_name));
          setPhoneNumber(handleString(contact.phone_number));
          setEmail(handleString(contact.email));
        }
      } else {
        // Clear fields if no contact is selected
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
      }
    }
  }, [selectedId, contacts, attendees]);

  useEffect(() => {
    setSelectedId("");
  }, [editingAttendee]);

  /**
   * Handle updating the selected contact in Supabase
   */
  async function handleUpdate() {
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !email.trim()) {
      showErrorMessage("All fields are required");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("contact_info")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email: email,
      })
      .eq("id", selectedId);
    setLoading(false);
    if (error) {
      showErrorMessage("Error updating contact information: " + error.message);
    } else {
      showSuccessMessage("Contact information successfully updated");
      // Refresh contacts
      const { data } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });
      setContacts(data || []);
    }
  }

  async function handleUpdateAttendee() {
    setShowConfirmEditEmailModal(false);
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!email.trim()) {
      showErrorMessage("Email is required");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("attendee_info")
      .update({
        email: email,
      })
      .eq("id", selectedId);
    setLoading(false);
    if (error) {
      showErrorMessage("Error updating attendee email: " + error.message);
    } else {
      showSuccessMessage("Attendee email successfully updated");
      // Refresh attendees
      const { data } = await supabase
        .from("attendee_info")
        .select("*")
        .order("name", { ascending: true });
      setAttendees(data || []);
    }
  }

  if (fetching) {
    return (
      <ThemedView>
        <View style={styles.header}>
          <ThemedText type="title">Contact Editor</ThemedText>
        </View>
        <View style={styles.content}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  // Picker style for the actual picker component
  const pickerStyle = {
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].background,
    flex: 1,
    minHeight: 48,
  };

  // Container style for the picker to show border properly
  const pickerContainerStyle = {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tint,
    backgroundColor: Colors[colorScheme].background,
    overflow: 'hidden' as 'hidden',
  };

  return (
    <ThemedView>
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme].tint }]}>
        <ThemedText type="title">Contact Editor</ThemedText>
        <ThemedText 
          style={[styles.subtitleText, { color: Colors[colorScheme].text }]} 
          type="subtitle"
        >
          {editingAttendee 
          ? "Select an attendee from the list to edit their email" 
          : "Select a planning team member from the list to edit their contact information"}
        </ThemedText>
        <View style={styles.toggleButtonContainer}>
          <Pressable 
            style={[
              styles.toggleButton,
              { backgroundColor: Colors[colorScheme].adminButton },
              { borderColor: Colors[colorScheme].tint },
            ]}
            onPress={() => setEditingAttendee(!editingAttendee)}
          >
            <ThemedText
              style={[
                styles.toggleButtonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              {editingAttendee ? "Edit Planning Team Member Info" : "Edit Attendee Emails"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        {/* Picker for selecting a contact */}
        <View style={pickerContainerStyle}>
          <Picker
            selectedValue={selectedId}
            onValueChange={value => {
              // Handle the "Select a contact" option and convert string to number if needed
              if (value === null || value === undefined || value === "" || value === "select") {
                setSelectedId("");
              } else {
                const numericValue = Number(value);
                // Only set if it's a valid number to avoid NaN
                if (!isNaN(numericValue)) {
                  setSelectedId(numericValue);
                }
              }
            }}
            style={pickerStyle}
            dropdownIconColor={Colors[colorScheme].tint}
            itemStyle={Platform.OS === 'ios' ? { color: Colors[colorScheme].text } : undefined}
            accessibilityLabel="Contact selection dropdown"
            accessibilityHint="Select a contact to edit their information"
            accessibilityRole="combobox"
          >
            <Picker.Item 
              label="Select a contact" 
              value="select" 
              color={Colors[colorScheme].text}
            />
            {editingAttendee ? attendees.map(attendee => (
              <Picker.Item
                key={attendee.id}
                label={handleString(attendee.name)}
                value={attendee.id}
                color={Colors[colorScheme].text}
              />
            )) : contacts.map(contact => (
              <Picker.Item
                key={contact.id}
                label={`${contact.first_name} ${contact.last_name}`}
                value={contact.id}
                color={Colors[colorScheme].text}
              />
            ))}
          </Picker>
        </View>
        
        {/* Form fields for editing */}
        {!editingAttendee && (
          <>
          <ThemedTextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            editable={selectedId !== "" && typeof selectedId === "number"}
            accessibilityLabel="First name input field"
            accessibilityHint="Enter the contact's first name"
          />
          <ThemedTextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            editable={selectedId !== "" && typeof selectedId === "number"}
            accessibilityLabel="Last name input field"
            accessibilityHint="Enter the contact's last name"
          />
          <ThemedTextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            editable={selectedId !== "" && typeof selectedId === "number"}
            accessibilityLabel="Phone number input field"
            accessibilityHint="Enter the contact's phone number"
          />
        </>
        )}
        <ThemedTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          editable={selectedId !== "" && typeof selectedId === "number"}
          accessibilityLabel="Email input field"
          accessibilityHint="Enter the contact's email address"
        />
        <Pressable
          onPress={editingAttendee ? () => setShowConfirmEditEmailModal(true) : handleUpdate}
          disabled={loading || selectedId === "" || typeof selectedId !== "number"}
          style={[
            styles.updateButton,
            loading || selectedId === "" || typeof selectedId !== "number" ? 
            { backgroundColor: Colors[colorScheme].tabIconDefault } : { backgroundColor: Colors[colorScheme].adminButton },
            { borderColor: Colors[colorScheme].adminButtonText },
          ]}
          accessibilityLabel="Update button"
          accessibilityHint="Press to save changes to the selected information"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading || selectedId === "" || typeof selectedId !== "number" }}
        >
          <ThemedText style={[styles.updateButtonText,
            { color: Colors[colorScheme].adminButtonText }
          ]}>
            {loading ? "Updating..." : editingAttendee ? "Update Attendee Email" : "Update Contact"}
          </ThemedText>
        </Pressable>
      </View>

      <ConfirmEditEmailModal
        visible={showConfirmEditEmailModal}
        attendeeName={attendeeName}
        attendeeEmail={email}
        onCancel={() => setShowConfirmEditEmailModal(false)}
        onConfirm={handleUpdateAttendee}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  subtitleText: {
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  updateButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
  },
  updateButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  toggleButtonContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
});