import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
}

if (!user) {
  return <Redirect href="/login" />;
}

return (
  <Stack
    screenOptions={{
      headerShown: false,
    }}
    />
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});