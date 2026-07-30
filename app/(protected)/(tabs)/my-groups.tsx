import { StyleSheet, Text, View } from "react-native";

export default function GroupsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Groups</Text>

            <Text style={styles.subtitle}>Your 5-a-side groups will appear here.</Text>
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
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});