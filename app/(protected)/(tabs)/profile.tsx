import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentProfile } from "../../../services/profileServices";
import { Profile } from "../../../types/profile";

import { supabase } from "../../../lib/supabase";

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
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <View style={styles.container}>
                <Text style={styles.title}>Profile</Text>

                <View style={styles.profileCard}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.value}>
                        {profile?.username || "No username found"}
                    </Text>

                    <View style={styles.divider} />

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },

    container: {
        flex: 1,
        backgroundColor: "#F5F6F8",
        paddingHorizontal: 24,
        paddingTop: 20,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 24,
    },

    profileCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 6,
    },

    value: {
        fontSize: 18,
        color: "#111827",
        marginBottom: 18,
    },

    button: {
        width: "100%",
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#B91C1C",
        backgroundColor: "#FFFFFF",

    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonText: {
        color: "#B91C1C",
        fontSize: 16,
        fontWeight: "700"
    },

    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 18,
    },
});