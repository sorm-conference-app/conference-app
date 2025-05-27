import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { Dimensions, StyleSheet, useColorScheme, useWindowDimensions, ScrollView } from "react-native";

const defaultWidth = () => Math.min(Dimensions.get('window').width, 400);
const wideHeight = () => Dimensions.get('window').width / 3;

export default function InfoScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { width: screenWidth } = useWindowDimensions();
    const isWideScreen = screenWidth > 1000;

    return (
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
        >
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>Maps</ThemedText>
                <ThemedView style={[styles.mapsContainer, isWideScreen && styles.mapsContainerWide]}>
                    <Image 
                        source={require('@/assets/images/EstiMap.png')} 
                        style={[styles.map, 
                            { width: isWideScreen ? wideHeight() * 85 / 103: defaultWidth(), 
                              height: isWideScreen ? wideHeight(): defaultWidth() * 103 / 85,
                              borderColor: Colors[colorScheme].tint, 
                              borderWidth: 4 }]}
                    />
                    <Image 
                        source={require('@/assets/images/BunteSORM.png')} 
                        style={[styles.map, 
                            { width: isWideScreen ? wideHeight() * 1586 / 908: defaultWidth(), 
                              height: isWideScreen ? wideHeight(): defaultWidth() * 908 / 1586,
                              borderColor: Colors[colorScheme].tint, 
                              borderWidth: 4 }]}
                    />
                </ThemedView>
                <ThemedText style={styles.infoText}>Contact Information</ThemedText>
            </ThemedView>
        </ScrollView>
    )
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
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    mapsContainer: {
        alignItems: 'center',
        width: '100%',
    },
    mapsContainerWide: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    map: {
        marginVertical: 20,
    },
    infoText: {
        marginTop: 20,
        fontSize: 16,
    },
});

