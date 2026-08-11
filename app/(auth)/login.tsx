import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, } from "react-native";

import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleLogin() {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !password) {
            Alert.alert("Missing details", "Please enter your email and password");
            return;
        }

        try {
            setIsSubmitting(true);

            const { error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
            });

            if (error) {
                Alert.alert("Login failed", error.message);
                return;
            }

            router.replace("/home");

        } catch {
            Alert.alert("Login failed", "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.formCard}>
                <Text style={styles.title}>Login</Text>
                <Text style={styles.subtitle}>Find Your Game</Text>

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

                <Pressable
                    onPress={handleLogin}
                    disabled={isSubmitting}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        isSubmitting && styles.buttonDisabled,
                    ]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>

                    )}
                </Pressable>

                <Link href="/register" style={styles.link}>
                    Create an account
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
        backgroundColor: "#000000",
    },

    formCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 24,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        textAlign: "center",
        color: "#111827",
    },

    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        color: "#FF7900",
        marginTop: 4,
        marginBottom: 24,
    },

    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
    },

    button: {
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#FF7900",
        marginTop: 2,
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

    link: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "#FF7900",
    },
});
