import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, } from "react-native";

import { getCurrentProfile } from "../../../services/profileServices";
import { Profile } from "../../../types/profile";

import { supabase } from "../../../lib/supabase";

const [profile, setProfile] = useState<Profile | null>(null);
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(true);

export default function ProfileScreen() {
const [profile, setProfile] = useState<Profile | null>(null);
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
    async function loadProfile() {
        try {
            const data = await getCurrentProfile();

            setProfile(data.profile);
            setEmail(data.email);
        } catch {
            Alert.alert("Profile error", "Unable to load your profile");
        } finally {
            setLoading(false);
        }
    }

    loadProfile();
}, []);

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

if (error) {
    Alert.alert("Logout failed", error.message);
    return;
}
    router.replace("/login")
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    } 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.profileCard}>
                <Text style={styles.label}>Username</Text>
                <Text style={styles.value}>
                    {profile?.username || "No username found"}
                </Text>

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{email}</Text>
            </View>

            <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={styles.buttonText}>Log out</Text>
            </Pressable>  
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 24,
    },

    profileCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 6,
    },

    value:  {
        fontSize: 18,
        color: "#111827",
        marginBottom: 20,
    },

    button: {
        minHeight: 52,
        paddingHorizontal: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    },
});