import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function RegisterScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>

            <Link href="/login" style={styles.link}>
                Already have an account?
            </Link>
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
        marginBottom: 20,
    },

    link: {
        fontSize: 16,
    },
});