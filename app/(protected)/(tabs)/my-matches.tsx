import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCreatedMatches, getJoinedMatches, } from "../../../services/matchService";
import type { Match, MatchWithCount } from "../../../types/match";

type MatchView = "created" | "joined";

export default function MyMatchesScreen() {
    const [selectedView, setSelectedView] =
        useState<MatchView>("created");

    const [matches, setMatches] = useState<MatchWithCount[]>([]);
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

    function renderMatch({ item }: { item: MatchWithCount }) {
        return (
            <Pressable
                onPress={() => router.push({
                    pathname: "/matches/[id]",
                    params: { id: item.id },
                })
                }
                style={({ pressed }) => [
                    styles.matchCard,
                    pressed && styles.matchCardPressed,
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
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="location-outline"
                            size={18}
                            color="#FF7900"
                        />
                    </View>

                    <Text style={styles.matchDetail}>
                        {item.location}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="FF7900"
                        />
                    </View>

                    <View style={{ width: 0 }} />

                    <Text style={styles.matchDetail}>
                        {formatMatchDate(item.match_date)}
                    </Text>
                </View>

                {item.description ? (
                    <Text
                        style={styles.description}
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                ) : null}

                <View style={styles.bottomRow}>

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
                                        : "Matches you join will appear here."}
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
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 20,
    },

    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
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
        backgroundColor: "#FF7900",
    },

    toggleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },

    activeToggleText: {
        color: "#FFFFFF",
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
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },

    matchCardPressed: {
        opacity: 0.75,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },

    matchTitle: {
        flex: 1,
        fontSize: 21,
        fontWeight: "700",
        color: "#111827"
    },

    playerCount: {
        fontSize: 21,
        fontWeight: "700",
        color: "#111827"
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    iconContainer: {
        width: 28,
        alignItems: "center",
        marginRight: 6,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },

    matchDetail: {
        flex: 1,
        fontSize: 15,
        color: "#4B5563",
    },

    description: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
        lineHeight: 20,
    },

    bottomRow: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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

    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8",
    },

    openBadge: {
        backgroundColor: "#DCFCE7"
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