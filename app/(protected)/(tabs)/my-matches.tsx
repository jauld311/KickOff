import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, } from "react-native";

import { getCreatedMatches, getJoinedMatches, } from "../../../services/matchService";
import type { Match } from "../../../types/match";

type MatchView = "created" | "joined";

export default function MyMatchesScreen() {
    const [selectedView, setSelectedView] =
        useState<MatchView>("created");

    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadMatches = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const results =
                selectedView === "created"
                    ? await getCreatedMatches()
                    : await getJoinedMatches();

            setMatches(results);
        } catch (error) {
            const message =
            error instanceof Error
                ? error.message
                : "Unable to load matches.";

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedView]);

    useFocusEffect(
        useCallback(() => {
            loadMatches();
        }, [loadMatches])
    );

    function formatMatchDate(matchDate: string) {
        const date = new Date(matchDate);
        
        return date.toLocaleString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatStatus(status: Match["status"]) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function renderMatch({ item }: {item: Match}) {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.matchCard,
                    pressed && styles.matchCardPressed,
                ]}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.matchTitle}>
                        {item.title}
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            item.status === "cancelled" &&
                                styles.cancelledBadge,
                            item.status === "full" &&
                                styles.fullBadge,
                        ]}
                    >
                        <Text style={styles.statusText}>
                            {formatStatus(item.status)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.matchDetail}>
                    {item.location}
                </Text>

                <Text style={styles.matchDetail}>
                    {formatMatchDate(item.match_date)}
                </Text>

                <Text style={styles.matchDetail}>
                    Maximum players: {item.maximum_players}
                </Text>

                {item.description ? (
                    <Text
                        style={styles.description}
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                ): null}

            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Matches</Text>

            <View style={styles.toggleContainer}>
                <Pressable
                    onPress={() => setSelectedView("created")}
                    style={[
                        styles.toggleButton,
                        selectedView === "created" &&
                            styles.activeToggleButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedView === "created" &&
                                styles.activeToggleText,
                        ]}
                    >
                        Created
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setSelectedView("joined")}
                    style={[
                        styles.toggleButton,
                        selectedView === "joined" &&
                            styles.activeToggleButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.toggleText,
                            selectedView === "joined" &&
                                styles.activeToggleText,
                        ]}
                    >
                        Joined
                    </Text>
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.messageContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.messageText}>
                        Loading matches...
                    </Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.messageContainer}>
                    <Text style={styles.errorText}>
                        {errorMessage}
                    </Text>

                    <Pressable
                        onPress={loadMatches}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMatch}
                    contentContainerStyle={
                        matches.length === 0
                            ? styles.emptyList
                            : styles.listContent
                    }
                    ListEmptyComponent={
                        <View style={styles.messageContainer}>
                            <Text style={styles.emptyTitle}>
                                No {selectedView} matches
                            </Text>

                            <Text style={styles.messageText}>
                                {selectedView === "created"
                                ? "Matches you create will appear here."
                                : "Matches you join will appear here." }
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },

    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#e3e3e3",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },

    toggleButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 9,
    },

    activeToggleButton: {
        backgroundColor: "#ffffff",
    },

    toggleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666666",
    },

    activeToggleText: {
        color: "#111111",
    },

    listContent: {
        paddingBottom: 30,
    },

    emptyList: {
        flexGrow: 1,
        justifyContent: "center",
    },

    matchCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
    },

    matchCardPressed: {
        opacity: 0.75,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },

    matchTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: "bold",
    },

    statusBadge: {
        backgroundColor: "#d8f3dc",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    fullBadge: {
        backgroundColor: "#fff0c2",
    },

    cancelledBadge: {
        backgroundColor: "#ffd6d6",
    },

    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },

    matchDetail: {
        fontSize: 15,
        color: "#444444",
        marginBottom: 6,
    },

    description: {
        fontSize: 14,
        color: "#666666",
        marginTop: 8,
        lineHeight: 20,
    },

    messageContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    messageText: {
        fontSize: 15,
        color: "#666666",
        textAlign: "center",
        marginTop: 12,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },

    errorText: {
        fontSize: 15,
        color: "#b00020",
        textAlign: "center",
    },

    retryButton: {
        backgroundColor: "#111111",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 16,
    },

    retryButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
});