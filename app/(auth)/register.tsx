import * as Linking from "expo-linking";
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
            Alert.alert("Invalid password",
                "Password must be at least 6 characters long"
            )
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match", "Try again.");
            return;
        }

        const { data: existingUsername, error: usernameError } = await supabase
            .from("profiles")
            .select("id")
            .ilike("username", trimmedUsername)
            .maybeSingle();

        if (usernameError) {
            Alert.alert(
                "Registration failed",
                "Unable to check username availability. Please try again."
            );
            return;
        }

        if (existingUsername) {
            Alert.alert(
                "Username unavailable",
                "That username is already taken. Please choose another."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const redirectUrl = Linking.createURL("/");
            console.log("Redirect URL:", redirectUrl);

            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        username: trimmedUsername,
                    },
                },
            });

            console.log("Signup data:", data);
            console.log("Signup error:", error);


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
            <View style={styles.formCard}>
                <Text style={styles.title}>KickOff</Text>
                <Text style={styles.subtitle}>Create account</Text>

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
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        isSubmitting && styles.buttonDisabled,
                    ]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
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


