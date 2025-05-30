import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import {
  Dimensions,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { MapViewer } from "@/components/MapViewer";
import React, { useState } from "react";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { IconSymbolName } from "@/components/ui/IconSymbol";

const defaultWidth = () => Math.min(Dimensions.get("window").width, 400);
const wideHeight = () => Dimensions.get("window").width / 3;

type ContactInfo = {
  name: string;
  phone: string;
  email: string;
};

const CONTACTS: ContactInfo[] = [
  {
    name: "Robert Turner",
    phone: "512.751.3511",
    email: "rturner@nbcesd1.com",
  },
  {
    name: "Chris Bygum",
    phone: "805.889.1807",
    email: "cbygum@gmail.com",
  },
  {
    name: "Shelby Hyman",
    phone: "512.653.5827",
    email: "shelby.hyman@sorm.texas.gov",
  },
  {
    name: "Monica Jackson",
    phone: "936.662.2946",
    email: "monica.jackson@txdmv.gov",
  },
  {
    name: "Brandon Murphy",
    phone: "512.936.2927",
    email: "brandon.murphy@sorm.texas.gov",
  },
  {
    name: "Mark Chadwick",
    phone: "512.936.1555",
    email: "mark.chadwick@sorm.texas.gov",
  },
  {
    name: "Stephen Vollbrecht",
    phone: "512.470.1989",
    email: "stephen.vollbrecht@gmail.com",
  },
];

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
        ]
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
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>
            Symposium Planning Team
          </ThemedText>
          <ThemedText style={styles.note}>
            Please text before calling or emailing
          </ThemedText>

          <ThemedView style={styles.contactsContainer}>
            {CONTACTS.map((contact, index) => (
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
                  index !== CONTACTS.length - 1 && styles.contactCardMargin,
                ]}
              >
                <ThemedView style={styles.contactInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.contactName}>
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
});
