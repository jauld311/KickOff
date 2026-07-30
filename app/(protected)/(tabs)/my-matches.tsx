import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MatchView = "created" | "joined";

export default function MyMatchesScreen() {
    const [selectedView, setSelectedView] =
        useState<MatchView>("created");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Matches</Text>

            <View style={styles.toggleContainer}>
                <Pressable
                    onPress={() => setSelectedView("created")}
                    style={[
                        styles.toggleButton,
                        selectedView === "created" &&
                        styles.toggleButtonSelected,
                    ]}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedView === "created" &&
                            styles.toggleTextSelected,
                        ]}
                    >
                        Created
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setSelectedView("joined")}
                    style={[
                        styles.toggleButton,
                        selectedView === "joined" &&
                        styles.toggleButtonSelected,
                    ]}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedView === "joined" &&
                            styles.toggleTextSelected,
                        ]}
                    >
                        Joined
                    </Text>
                </Pressable>
            </View>

            <View style={styles.content}>
                {selectedView === "created" ? (
                    <>
                    <Text style={styles.sectionTitle}>
                        Matches you created
                    </Text>

                    <Text style={styles.emptyText}>
                        You have not created any matches yet.
                    </Text>
                    </>
                ) : (
                    <>
                    <Text style={styles.sectionTitle}>
                        Matches you have joined
                    </Text>

                    <Text style={styles.emptyText}>
                        You have not joined any matches yet.
                    </Text>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#FFFFFF"
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 24,
    },

    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
        borderRadius: 10,
        padding: 4,
    },

    toggleButton: {
        flex: 1,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },

    toggleButtonSelected: {
        backgroundColor: "#111827",
    },

    toggleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4B5563",
    },

    toggleTextSelected: {
        color: "#FFFFFF",
    },

    content: {
        marginTop: 32,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },

    emptyText: {
        fontSize: 16,
        color: "#6B7280",
    },
});