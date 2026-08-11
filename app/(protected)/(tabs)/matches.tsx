import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPostedMatches } from "../../../services/matchService";
import type { Match, MatchWithCount } from "../../../types/match";

export default function MatchesScreen() {
    const [matches, setMatches] = useState<MatchWithCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const loadMatches = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const results = await getPostedMatches();
            setMatches(results);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to load matches"

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            minute: "2-digit"
        });
    }

    function formatStatus(status: Match["status"]) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function renderMatch({ item }: { item: MatchWithCount }) {

        const playersNeeded = item.maximum_players - item.participant_count;

        return (
            <Pressable
                onPress={() =>
                    router.push({
                        pathname: "/matches/[id]",
                        params: { id: item.id },
                    })
                }
                style={({ pressed }) => [
                    styles.matchCard,
                    pressed && styles.matchCardPressed
                ]}
            >
                <View style={styles.cardHeader}>
                    <Text
                        style={styles.matchTitle}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>

                    <Text style={styles.playerCount}>
                        {item.participant_count}/{item.maximum_players}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons
                        name="location-outline"
                        size={18}
                        color="#FF7900"
                    />

                    <Text style={styles.matchDetail}>
                        {item.location}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#FF7900"
                    />

                    <Text style={styles.matchDetail}>
                        {formatMatchDate(item.match_date)}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.playersNeeded}>
                        {playersNeeded}{" "}
                        {playersNeeded === 1 ? "player" : "players"} needed!
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            item.status === "open" && styles.openBadge,
                            item.status === "full" && styles.fullBadge,
                            item.status === "cancelled" && styles.cancelledBadge,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                item.status === "open" && styles.openStatusText,
                                item.status === "full" && styles.fullStatusText,
                                item.status === "cancelled" && styles.cancelledStatusText,
                            ]}
                        >
                            {formatStatus(item.status)}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <View style={styles.container}>
                <Text style={styles.title}>Matches</Text>

                {isLoading ? (
                    <View style={styles.messageContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.errorText}>{errorMessage}</Text>

                        <Pressable onPress={loadMatches} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
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
                        refreshing={isLoading}
                        onRefresh={loadMatches}
                        ListEmptyComponent={
                            <View style={styles.messageContainer}>
                                <Text style={styles.emptyTitle}>No posted matches</Text>
                                <Text style={styles.messageText}>
                                    Matches posted by organisers will appear here.
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
        marginBottom: 20,
        color: "#111827",
    },

    createButton: {
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
        marginBottom: 20,
    },

    createButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
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

    matchCardPressed: {
        opacity: 0.75,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    matchTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginRight: 12,
    },

    playerCount: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },

    bottomRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
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

    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },

    matchCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },

    matchDetail: {
        flex: 1,
        fontSize: 16,
        color: "#4B5563",
    },

    playersNeeded: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FF7900",
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 13,
        fontWeight: "700",
    },

    openBadge: {
        backgroundColor: "#DCFCE7",
    },

    openStatusText: {
        color: "#166534",
    },

    fullBadge: {
        backgroundColor: "#FEF3C7",
    },

    fullStatusText: {
        color: "#92400E",
    },

    cancelledBadge: {
        backgroundColor: "#FEE2E2",
    },

    cancelledStatusText: {
        color: "#DC2626",
    },
});