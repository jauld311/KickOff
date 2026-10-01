import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createMatch } from "../../services/matchService";

export default function CreateMatchScreen() {
    const [title, setTitle] = useState("");
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [maximumPlayers, setMaximumPlayers] = useState(10);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreateMatch() {
        if (!title || !location || !date) {
            Alert.alert(
                "Missing information",
                "Please complete all required fields."
            );
            return;
        }

        if (!groupId) {
            Alert.alert(
                "Missing group",
                "This match must be created from inside a group"
            );
            return;
        }

        try {
            setLoading(true);

            await createMatch({
                title,
                location,
                matchDate: date,
                maximumPlayers,
                description,
                groupId,
            });

            Alert.alert("Success", "Match created successfully");

            router.back();
        } catch (error: unknown) {

            let message = "Something went wrong.";

            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error
            ) {
                message = String(error.message);
            }

            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Create Match</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Match Title</Text>
                        <TextInput
                            placeholder="e.g. Tuesday Night Football"
                            placeholderTextColor="#6B7280"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            placeholder="Sports Venue 3G"
                            placeholderTextColor="#6B7280"
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Date and Time</Text>
                        <TextInput
                            placeholder="28 July 2027, 9:00"
                            placeholderTextColor="#6B7280"
                            value={date}
                            onChangeText={setDate}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Maximum Players</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={maximumPlayers}
                                onValueChange={(value) => setMaximumPlayers(value)}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="5-a-side (10 players)" value={10} />
                                <Picker.Item label="6-a-side (12 players)" value={12} />
                                <Picker.Item label="7-a-side (14 players)" value={14} />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            placeholder="(optional)"
                            placeholderTextColor="#6B7280"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={[styles.input, styles.description]}
                        />
                    </View>

                    <Pressable
                        onPress={handleCreateMatch}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Creating..." : "Create Match"}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },

    container: {
        padding: 24,
        paddingTop: 12,
        paddingBottom: 48,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 28,
    },

    field: {
        marginBottom: 20,
    },

    pickerContainer: {
        height: 78,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
    },

    picker: {
        width: "100%",
        height: 180,
    },

    pickerItem: {
        width: 320,
        height: 180,
        fontSize: 17,
        color: "#111827",
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },

    input: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },

    description: {
        minHeight: 120,
        textAlignVertical: "top",
    },

    helperText: {
        marginTop: 6,
        fontSize: 13,
        color: "#6B7280",
    },

    button: {
        marginTop: 8,
        minHeight: 54,
        backgroundColor: "#FF7900",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});