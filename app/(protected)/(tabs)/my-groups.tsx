import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { getAvailableGroups, getMyGroups } from "../../../services/groupService";
import type { Group } from "../../../types/group";

type GroupView = "My Groups" | "Find a group";

export default function MyGroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedView, setSelectedView] = useState<GroupView>("My Groups");
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [myGroupsResult, availableGroupsResult] =
        await Promise.all([
          getMyGroups(),
          getAvailableGroups(),
        ]);

      setGroups(myGroupsResult);
      setAvailableGroups(availableGroupsResult)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load groups."

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  function renderGroup({ item }: { item: Group }) {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/groups/[id]",
            params: { id: item.id },
          })
        }
        style={({ pressed }) => [
          styles.groupCard,
          pressed && styles.groupCardPressed,
        ]}
      >
        <View style={styles.groupCardContent}>
          <View style={styles.groupIcon}>
            <Ionicons
              name="people-outline"
              size={24}
              color="#FF7900"
            />
          </View>


          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>
              {item.name}
            </Text>

            {item.description ? (
              <Text
                style={styles.groupDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : (
              <Text style={styles.groupDescription}>
                No description
              </Text>
            )}
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#6B7280"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>My Groups</Text>

        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setSelectedView("My Groups")}
            style={[
              styles.toggleButton,
              selectedView === "My Groups" &&
              styles.activeToggleButton,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                selectedView === "My Groups" &&
                styles.activeToggleText,
              ]}
            >
              My Groups
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedView("Find a group")}
            style={[
              styles.toggleButton,
              selectedView === "Find a group" &&
              styles.activeToggleButton,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                selectedView === "Find a group" &&
                styles.activeToggleText,
              ]}
            >
              Find Groups
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/create-group")}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.messageText}>
              Loading groups...
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>

            <Pressable
              onPress={loadGroups}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={
              selectedView === "My Groups"
                ? groups
                : availableGroups
            }
            keyExtractor={(item) => item.id}
            renderItem={renderGroup}
            contentContainerStyle={
              groups.length === 0
                ? styles.emptyList
                : styles.listContent
            }
            onRefresh={loadGroups}
            refreshing={isLoading}
            ListEmptyComponent={
              <View style={styles.messageContainer}>
                <Text style={styles.emptyTitle}>
                  {selectedView === "My Groups"
                    ? "No groups yet"
                    : "No groups available"}
                </Text>

                <Text style={styles.messageText}>
                  {selectedView === "My Groups"
                    ? "Create a group or join a group to see it here."
                    : "There are currently no other groups to join."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },

  createButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FF7900",
    marginBottom: 20,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  listContent: {
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  groupCardPressed: {
    opacity: 0.75,
  },

  groupCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  groupIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  groupInfo: {
    flex: 1,
    marginRight: 10,
  },

  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  groupDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginTop: 5,
  },

  messageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  messageText: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  errorText: {
    fontSize: 15,
    color: "#B91C1C",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },

  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 9,
  },

  activeToggleButton: {
    backgroundColor: "#FF7900",
  },

  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeToggleText: {
    color: "#FFFFFF",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
});