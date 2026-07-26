import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "../../lib/supabase";

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

            <Pressable
                onPress={handleLogout}
                style={({ pressed}) => [
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