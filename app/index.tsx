import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.status}>Checking session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KickOff</Text>

      <Text style={styles.status}>
        {user
          ? `Signed in as ${user.email}`
          : "No user is currently signed in."}
      </Text>
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
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    textAlign: "center",
  },
});