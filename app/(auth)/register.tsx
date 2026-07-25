import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, } from "react-native";

import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleRegister() {
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim().toLowerCase();
    

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
        Alert.alert("Missing details", "Please complete every field");
        return;
    }

    if (password.length < 6) {
        Alert.alert( "Invalid password",
            "Password must be at least 6 characters long"
        )
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert("Passwords do not match", "Try again.");
        return;
    }

    try {
        setIsSubmitting(true);

        const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
                data: {
                    username: trimmedUsername,
                },
            },
        });
    

    if (error) {
        Alert.alert("Registration failed", error.message);
        return;
    }

    if (!data.session) {
        Alert.alert(
            "Check your email",
            "Account created! Confirm your email address to log in."
        );

        router.replace("/login");
    }
} catch {
    Alert.alert(
        "Registration failed",
        "Something went wrong. Please try again."
    );
} finally { 
    setIsSubmitting(false);
}
}

return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <View style={styles.form}>
            <Text style={styles.title}>Create account</Text>

            <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
            />

            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
            />

            <Pressable
                onPress={handleRegister}
                disabled={isSubmitting}
                style={({ pressed}) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    isSubmitting && styles.buttonDisabled,
                ]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </Pressable>

                <Link href="/login" style={styles.link}>
                    Already have an account? 
                </Link>
        </View>
    </KeyboardAvoidingView>
    );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },

    form: {
        width: "100%",
        gap: 16,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },

    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: "A1A1AA",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
    },

    button: {
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
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
        fontWeight: "600",
    },

    link: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 16,
    },
});


