import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function MatchesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Matches</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push("/create-match")}
            >
                <Text style={styles.buttonText}>Create Match</Text>
            </Pressable>

            <Text style={styles.placeholder}>
                Upcoming matches will appear here.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 24,
    },

    button: {
        backgroundColor: "#111827",
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 24,
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },

    placeholder: {
        fontSize: 16,
        color: "#6B7280",
    },
});