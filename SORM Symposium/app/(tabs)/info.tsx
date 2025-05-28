import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { Dimensions, StyleSheet, useColorScheme, useWindowDimensions, ScrollView, TouchableOpacity } from "react-native";
import { MapViewer } from "@/components/MapViewer";
import { useState } from "react";

const defaultWidth = () => Math.min(Dimensions.get('window').width, 400);
const wideHeight = () => Dimensions.get('window').width / 3;

export default function InfoScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { width: screenWidth } = useWindowDimensions();
    const isWideScreen = screenWidth > 1000;
    const [selectedMap, setSelectedMap] = useState<null | string>(null);

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
                    <ThemedView 
                        style={[styles.mapBlock, 
                            {borderColor: Colors[colorScheme].tint, 
                            backgroundColor: Colors[colorScheme].secondaryBackgroundColor}]}>
                        <ThemedText style={styles.mapTitle}>Facility Map</ThemedText>
                        <TouchableOpacity onPress={() => setSelectedMap('esti')}>
                            <Image 
                                source={require('@/assets/images/EstiMap.png')} 
                                style={[styles.map, 
                                    { width: isWideScreen ? wideHeight() * 85 / 103: defaultWidth(), 
                                    height: isWideScreen ? wideHeight(): defaultWidth() * 103 / 85, }]}
                            />
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedView 
                        style={[styles.mapBlock,
                            {borderColor: Colors[colorScheme].tint, 
                            backgroundColor: Colors[colorScheme].secondaryBackgroundColor}]}>
                        <ThemedText style={styles.mapTitle}>Les Bunte Complex</ThemedText>
                        <TouchableOpacity onPress={() => setSelectedMap('bunte')}>
                            <Image 
                                source={require('@/assets/images/BunteSORM.png')} 
                                style={[styles.map, 
                                    { width: isWideScreen ? wideHeight() * 1586 / 908: defaultWidth(), 
                                    height: isWideScreen ? wideHeight(): defaultWidth() * 908 / 1586, }]}
                            />
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
                <ThemedText style={styles.infoText}>Contact Information</ThemedText>
            </ThemedView>

            <MapViewer
                imageSource={selectedMap === 'esti' 
                    ? require('@/assets/images/EstiMap.png')
                    : require('@/assets/images/BunteSORM.png')}
                isVisible={selectedMap !== null}
                onClose={() => setSelectedMap(null)}
            />
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
        gap: 10,
    },
    mapsContainerWide: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    mapBlock: {
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
    },
    mapTitle: {
        fontWeight: 'bold',
        paddingTop: 10,
    },
    map: {
        marginVertical: 10,
    },
    infoText: {
        marginTop: 20,
        fontSize: 16,
    },
});

