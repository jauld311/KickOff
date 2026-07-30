import { Alert, StyleSheet, Text, View } from "react-native";

import { supabase } from "../../../lib/supabase";

export default function HomeScreen() {
    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            Alert.alert("Logout failed", error.message);
            return;
        }
    }
    return ( 
        <View style={styles.container}>
            <Text style={styles.title}>KickOff</Text>
            <Text style={styles.subtitle}>Find and join local 5-a-side matches</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
    },

    subtitle: {
        fontSize: 16,
        textAlign: "center",
    },

    button: {
        minHeight: 52,
        paddingHorizontal: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827"
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    }
});