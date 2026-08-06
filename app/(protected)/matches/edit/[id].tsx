import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getMatchById,
    updateMatch,
} from "../../../../services/matchService";

export default function EditMatchScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [matchDate, setMatchDate] = useState("");
    const [maximumPlayers, setMaximumPlayers] = useState(10);
    const [description, setDescription] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadMatch() {
            if (!id) {
                return;
            }

            try {
                const match = await getMatchById(id);

                setTitle(match.title);
                setLocation(match.location);
                setMatchDate(
                    new Date(match.match_date).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })
                );
                setMaximumPlayers(match.maximum_players);
                setDescription(match.description ?? "")
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load the match.";

                Alert.alert("Error", message);
            } finally {
                setIsLoading(false);
            }
        }

        loadMatch();
    }, [id]);

    async function handleSave() {
        if (!id) {
            return;
        }

        if (!title.trim() || !location.trim() || !matchDate.trim()) {
            Alert.alert(
                "Missing information",
                "Please complete all required fields."
            );
            return;
        }

        try {
            setIsSaving(true);

            await updateMatch(id, {
                title,
                location,
                matchDate,
                maximumPlayers,
                description,
            });

            Alert.alert("Success", "Match updated successfully.", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update the match";

            Alert.alert("Update failed", message);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Edit Match</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Match title</Text>

                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Location</Text>

                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Date and time</Text>

                        <TextInput
                            value={matchDate}
                            onChangeText={setMatchDate}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={maximumPlayers}
                                onValueChange={(value: number) =>
                                    setMaximumPlayers(value)
                                }
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item
                                    label="5 a side - 10 players"
                                    value={10}
                                />
                                <Picker.Item
                                    label="6 a side - 12 players"
                                    value={12}
                                />
                                <Picker.Item
                                    label="7 a side - 14 players"
                                    value={14}
                                />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Description</Text>

                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={[styles.input, styles.description]}
                        />
                    </View>

                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        style={({ pressed }) => [
                            styles.saveButton,
                            pressed && styles.buttonPressed,
                            isSaving && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? "Saving..." : "Save Changes"}
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
        backgroundColor: "#FFFFFF",
    },

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    container: {
        paddingHorizontal: 24,
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

    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },

    input: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: "#C7CDD4",
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

    pickerContainer: {
        height: 180,
        borderWidth: 1,
        borderColor: "#C7CDD4",
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
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

    saveButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
        marginTop: 8,
    },

    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonDisabled: {
        opacity: 0.5,
    },
});