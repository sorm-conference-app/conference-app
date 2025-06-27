import { MapViewer } from "@/components/MapViewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { IconSymbolName } from "@/components/ui/IconSymbol";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { ContactInfo, useContacts } from "@/hooks/useContacts";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultWidth = () => Math.min(Dimensions.get("window").width, 400);
const wideHeight = () => Dimensions.get("window").width / 3;

type ContactAction = {
  icon: IconSymbolName;
  label: string;
  action: (contact: ContactInfo) => void;
};

export default function InfoScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width: screenWidth } = useWindowDimensions();
  const isWideScreen = screenWidth > 1000;
  const [selectedMap, setSelectedMap] = useState<null | string>(null);
  const insets = useSafeAreaInsets();
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(
    null
  );

  // Fetch contacts from Supabase
  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
  } = useContacts();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\./g, "")}`);
  };

  const handleText = (phone: string) => {
    Linking.openURL(`sms:${phone.replace(/\./g, "")}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const contactActions: ContactAction[] = [
    {
      icon: "envelope.fill",
      label: "Email",
      action: (contact) => handleEmail(contact.email),
    },
    {
      icon: "phone.fill",
      label: "Call",
      action: (contact) => handleCall(contact.phone),
    },
    {
      icon: "message.fill",
      label: "Text",
      action: (contact) => handleText(contact.phone),
    },
  ];

  const showContactOptions = (contact: ContactInfo) => {
    if (Platform.OS === "web") {
      setSelectedContact(contact);
    } else {
      Alert.alert(
        `Contact ${contact.name}`,
        "Please text before calling or emailing.",
        [
          {
            text: "Text",
            onPress: () => handleText(contact.phone),
            style: "default",
          },
          {
            text: "Call",
            onPress: () => handleCall(contact.phone),
          },
          {
            text: "Email",
            onPress: () => handleEmail(contact.email),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          {
            paddingBottom: Platform.select({
              ios: Math.max(insets.bottom + 20, 90),
              default: 0,
            }),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
        scrollEnabled={isScrollEnabled}
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>Maps</ThemedText>
          <ThemedView
            style={[
              styles.mapsContainer,
              isWideScreen && styles.mapsContainerWide,
            ]}
          >
            <ThemedView
              style={[
                styles.mapBlock,
                {
                  borderColor: Colors[colorScheme].tint,
                  backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                },
              ]}
            >
              <ThemedText style={styles.mapTitle}>Facility Map</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMap("esti");
                  setIsScrollEnabled(false);
                }}
              >
                <Image
                  source={require("@/assets/images/EstiMap.png")}
                  style={[
                    styles.map,
                    {
                      width: isWideScreen
                        ? (wideHeight() * 85) / 103
                        : defaultWidth(),
                      height: isWideScreen
                        ? wideHeight()
                        : (defaultWidth() * 103) / 85,
                    },
                  ]}
                  alt="Facility Map"
                />
              </TouchableOpacity>
            </ThemedView>
            <ThemedView
              style={[
                styles.mapBlock,
                {
                  borderColor: Colors[colorScheme].tint,
                  backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                },
              ]}
            >
              <ThemedText style={styles.mapTitle}>Les Bunte Complex</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMap("bunte");
                  setIsScrollEnabled(false);
                }}
              >
                <Image
                  source={require("@/assets/images/BunteSORM.png")}
                  style={[
                    styles.map,
                    {
                      width: isWideScreen
                        ? (wideHeight() * 1586) / 908
                        : defaultWidth(),
                      height: isWideScreen
                        ? wideHeight()
                        : (defaultWidth() * 908) / 1586,
                    },
                  ]}
                  alt="Les Bunte Complex Map"
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>
            Emergency Information
          </ThemedText>
          <ThemedText style={styles.emergencyNote}>
            Call 911 immediately for any emergency
          </ThemedText>

          <ThemedView style={styles.emergencyContainer}>
            <ThemedView
              style={[
                styles.emergencyCard,
                {
                  backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                  borderColor: Colors[colorScheme].tint,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.emergencyCardTitle}
              >
                Symposium Venue
              </ThemedText>
              <ThemedText style={styles.venueAddress}>
                Les Bunte Complex{"\n"}
                1595 Nuclear Science Road{"\n"}
                College Station, TX 77843
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={[
                styles.emergencyCard,
                {
                  backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                  borderColor: Colors[colorScheme].tint,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.emergencyCardTitle}
              >
                Event Rooms
              </ThemedText>
              <ThemedText style={styles.roomInfo}>
                • B101A {"\n"}• B102C&D{"\n"}• B102A&B
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={[
                styles.emergencyCard,
                {
                  backgroundColor: Colors[colorScheme].secondaryBackgroundColor,
                  borderColor: Colors[colorScheme].tint,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.emergencyCardTitle}
              >
                Local Emergency Services
              </ThemedText>
              <ThemedView
                style={[
                  styles.emergencyContact,
                  {
                    backgroundColor:
                      Colors[colorScheme].secondaryBackgroundColor,
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold" style={styles.contactLabel}>
                  College Station Police, Fire, and Animal Control
                  (Non-Emergency):
                </ThemedText>
                <TouchableOpacity onPress={() => handleCall("979-764-3500")}>
                  <ThemedText style={styles.emergencyPhone}>
                    979-764-3500
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>
            Symposium Planning Team
          </ThemedText>
          <ThemedText style={styles.note}>
            Please text before calling or emailing
          </ThemedText>

          <ThemedView style={styles.contactsContainer}>
            {contactsLoading && (
              <ThemedText style={styles.contactText}>
                Loading contacts…
              </ThemedText>
            )}
            {contactsError && (
              <ThemedText style={[styles.contactText, { color: "red" }]}>
                Failed to load contacts.
              </ThemedText>
            )}
            {!contactsLoading && !contactsError && contacts.length === 0 && (
              <ThemedText style={styles.contactText}>
                No contacts available.
              </ThemedText>
            )}
            {!contactsLoading &&
              !contactsError &&
              contacts.map((contact, index) => (
                <TouchableOpacity
                  key={contact.email}
                  onPress={() => showContactOptions(contact)}
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor:
                        Colors[colorScheme].secondaryBackgroundColor,
                      borderColor: Colors[colorScheme].tint,
                    },
                    index !== contacts.length - 1 && styles.contactCardMargin,
                  ]}
                >
                  <ThemedView style={styles.contactInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.contactName}
                    >
                      {contact.name}
                    </ThemedText>
                    <ThemedView style={styles.contactDetail}>
                      <IconSymbol name="phone.fill" color="#666" size={16} />
                      <ThemedText style={styles.contactText}>
                        {contact.phone}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.contactDetail}>
                      <IconSymbol name="envelope.fill" color="#666" size={16} />
                      <ThemedText style={styles.contactText}>
                        {contact.email}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <IconSymbol name="chevron.right" color="#666" size={24} />
                </TouchableOpacity>
              ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <Modal
        visible={selectedContact !== null}
        transparent={true}
        onRequestClose={() => setSelectedContact(null)}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedContact(null)}
        >
          <ThemedView
            style={[
              styles.contactMenu,
              { backgroundColor: Colors[colorScheme].secondaryBackgroundColor },
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.contactMenuTitle}>
              Contact {selectedContact?.name}
            </ThemedText>
            <ThemedText style={styles.contactMenuNote}>
              Please text before calling or emailing
            </ThemedText>
            {contactActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.contactMenuItem}
                onPress={() => {
                  if (selectedContact) {
                    action.action(selectedContact);
                  }
                  setSelectedContact(null);
                }}
              >
                <IconSymbol name={action.icon} color="#666" size={20} />
                <ThemedText style={styles.contactMenuItemText}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.contactMenuItem, styles.cancelButton]}
              onPress={() => setSelectedContact(null)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Pressable>
      </Modal>

      <MapViewer
        imageSource={
          selectedMap === "esti"
            ? require("@/assets/images/EstiMap.png")
            : require("@/assets/images/BunteSORM.png")
        }
        isVisible={selectedMap !== null}
        onClose={() => {
          setSelectedMap(null);
          setIsScrollEnabled(true);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 8,
  },
  note: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
    fontStyle: "italic",
  },
  emergencyNote: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
    fontStyle: "italic",
    color: "#FF3B30",
    fontWeight: "600",
  },
  mapsContainer: {
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  mapsContainerWide: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mapBlock: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  mapTitle: {
    fontWeight: "bold",
    paddingTop: 10,
  },
  map: {
    marginVertical: 10,
  },
  contactsContainer: {
    width: "100%",
    paddingHorizontal: 16,
    maxWidth: 600,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactCardMargin: {
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    marginBottom: 4,
  },
  contactDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  contactText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contactMenu: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  contactMenuTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 4,
  },
  contactMenuNote: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 12,
    fontStyle: "italic",
  },
  contactMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  contactMenuItemText: {
    fontSize: 16,
  },
  cancelButton: {
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#FF3B30",
    fontWeight: "600",
  },
  emergencyContainer: {
    width: "100%",
    padding: 16,
    maxWidth: 600,
  },
  emergencyCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  venueAddress: {
    fontSize: 16,
  },
  roomInfo: {
    fontSize: 16,
  },
  emergencyContact: {
    marginTop: 8,
  },
  contactLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 16,
  },
});
