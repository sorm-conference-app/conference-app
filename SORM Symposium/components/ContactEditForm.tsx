import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tables } from "@/types/Supabase.types";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";
import { ThemedView } from "./ThemedView";

/**
 * Form for editing existing contact information in Supabase.
 * Allows selection of a contact, editing their info, and updating in the database.
 * @returns JSX.Element
 */
export default function ContactEditForm() {
  // State for all contacts
  const [contacts, setContacts] = useState<Tables<'contact_info'>[]>([]);
  // State for selected contact id (use empty string for web compatibility)
  const [selectedId, setSelectedId] = useState<number | string>("");
  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [disabled, setDisabled] = useState(true);
  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
        Alert.alert("Error", error.message);
        setContacts([]);
      } else {
        setContacts(data || []);
      }
      setFetching(false);
    }
    fetchContacts();
  }, []);

  // When a contact is selected, always prefill the form fields
  useEffect(() => {
    if (selectedId !== "" && typeof selectedId === "number") {
      const contact = contacts.find(c => c.id === selectedId);
      if (contact) {
        setFirstName(contact.first_name);
        setLastName(contact.last_name);
        setPhoneNumber(contact.phone_number);
        setEmail(contact.email);
      }
    } else {
      // Clear fields if no contact is selected
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
    }
  }, [selectedId, contacts]);

  /**
   * Handle updating the selected contact in Supabase
   */
  async function handleUpdate() {
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim() || !email.trim()) {
      Alert.alert("Error", "All fields are required");
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
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Contact updated");
      // Optionally refresh contacts
      const { data } = await supabase
        .from("contact_info")
        .select("*")
        .order("last_name", { ascending: true });
      setContacts(data || []);
    }
  }

  if (fetching) {
    return (
      <ThemedView style={styles.container}>
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
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme].tint }]}>
        <ThemedText type="title">Contact Editor</ThemedText>
        <ThemedText 
          style={[styles.subtitleText, { color: Colors[colorScheme].text }]} 
          type="subtitle"
        >
          Select a contact from the list to edit their information
        </ThemedText>
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
              color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
            />
            {contacts.map(contact => (
              <Picker.Item
                key={contact.id}
                label={`${contact.first_name} ${contact.last_name}`}
                value={contact.id}
                color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
              />
            ))}
          </Picker>
        </View>
        
        {/* Form fields for editing */}
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
        onPress={handleUpdate}
        disabled={loading || selectedId === "" || typeof selectedId !== "number"}
        style={[
          styles.updateButton,
          loading || selectedId === "" || typeof selectedId !== "number" ? 
          { backgroundColor: Colors[colorScheme].tabIconDefault } : { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
        accessibilityLabel="Update contact button"
        accessibilityHint="Press to save changes to the selected contact"
        accessibilityRole="button"
        accessibilityState={{ disabled: loading || selectedId === "" || typeof selectedId !== "number" }}
      >
        <ThemedText style={[styles.updateButtonText,
          { color: Colors[colorScheme].adminButtonText }
        ]}>
          {loading ? "Updating..." : "Update Contact"}
        </ThemedText>
      </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    alignItems: 'center',
  },
  updateButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});