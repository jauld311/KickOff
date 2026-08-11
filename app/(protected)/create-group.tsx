import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createGroup } from "../../services/groupService";

export default function CreateGroupScreen() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreateGroup() {
        if (!name.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter a group name."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await createGroup({
                name,
                description,
            });

            Alert.alert("Success", "Group created successfully.", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create the group";

            Alert.alert("Create group failed", message);
        } finally {
            setIsSubmitting(false);
        }
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
                >
                    <Text style={styles.title}>Create Group</Text>

                    <Text style={styles.label}>Group name</Text>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g Ulster Small Sided Games"
                        placeholderTextColor="#6B7280"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Description</Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe the group"
                        placeholderTextColor="#6B7280"
                        multiline
                        style={[styles.input, styles.description]}
                    />

                    <Pressable
                        onPress={handleCreateGroup}
                        disabled={isSubmitting}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            isSubmitting && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {isSubmitting
                                ? "Creating..."
                                : "Create Group"}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8",
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
        marginBottom: 22,
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
        marginBottom: 20,
    },

    description: {
        minHeight: 120,
        textAlignVertical: "top",
    },

    button: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#FF7900",
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