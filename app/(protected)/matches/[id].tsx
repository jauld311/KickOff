import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    cancelMatch,
    deleteMatch,
    getMatchById,
    hasJoinedMatch,
    joinMatch,
    leaveMatch,
    postMatchToFeed,
    removeMatchFromFeed
} from "../../../services/matchService";
import type { MatchWithCount } from "../../../types/match";

import { useAuth } from "../../../contexts/AuthContext";

export default function MatchDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [match, setMatch] = useState<MatchWithCount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingFeed, setIsUpdatingFeed] = useState(false);
    const [hasJoined, setHasJoined] = useState(false);
    const [isUpdatingParticipation, setIsUpdatingParticipation] =
        useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const { user } = useAuth();

    const isCreator = user?.id === match?.creator_id;

    useEffect(() => {
        async function loadMatch() {
            if (!id) {
                return;
            }

            try {
                const result = await getMatchById(id);
                const joined = await hasJoinedMatch(id);

                setMatch(result);
                setHasJoined(joined);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load match.";

                Alert.alert("Error", message);
            } finally {
                setIsLoading(false);
            }
        }
        loadMatch();
    }, [id]);

    async function handleFeedToggle() {
        if (!match) {
            return;
        }

        try {
            setIsUpdatingFeed(true)

            if (match.is_posted) {
                await removeMatchFromFeed(match.id)

                setMatch({
                    ...match,
                    is_posted: false,
                    posted_at: null,
                });
            } else {
                await postMatchToFeed(match.id);

                setMatch({
                    ...match,
                    is_posted: true,
                    posted_at: new Date().toISOString(),
                });
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update the match.";

            Alert.alert("Error", message);
        } finally {
            setIsUpdatingFeed(false);
        }
    }

    async function handleParticipation() {
        if (!match) {
            return;
        }

        try {
            setIsUpdatingParticipation(true);

            if (hasJoined) {
                await leaveMatch(match.id);
            } else {
                await joinMatch(match.id);
            }

            const updatedMatch = await getMatchById(match.id);
            const joined = await hasJoinedMatch(match.id);

            setMatch(updatedMatch);
            setHasJoined(joined);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update participation";

            Alert.alert("Error", message);
        } finally {
            setIsUpdatingParticipation(false);
        }
    }

    function handleDeleteMatch() {
        if (!match) {
            return;
        }

        Alert.alert(
            "Delete match?",
            "This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsDeleting(true);

                            await deleteMatch(match.id);

                            router.replace("/my-matches");
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Unable to delete the match.";

                            Alert.alert("Delete failed", message);
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    }

    function handleCancelMatch() {
        if (!match) {
            return;
        }

        Alert.alert(
            "cancel match?",
            "Players will no longer be able to join this match.",
            [
                {
                    text: "Keep Match",
                    style: "cancel",
                },
                {
                    text: "Cancel Match",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsCancelling(true);

                            await cancelMatch(match.id);

                            setMatch({
                                ...match,
                                status: "cancelled",
                                is_posted: false,
                                posted_at: null,
                            });
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Unable to cancel the match.";

                            Alert.alert("cancellation failed", message);
                        } finally {
                            setIsCancelling(false);
                        }
                    },
                },
            ]
        );
    }

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!match) {
        return (
            <View style={styles.centered}>
                <Text>Match not found.</Text>
            </View>
        );
    }

    const isFull =
        match.participant_count >= match.maximum_players;

    const isCancelled = match.status === "cancelled";

    return (

        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>{match.title}</Text>

                <View
                    style={[
                        styles.statusBadge,
                        match.status === "cancelled" && styles.cancelledStatusBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            match.status === "cancelled" &&
                            styles.cancelledStatusText,
                        ]}
                    >
                        {match.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>{match.location}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.label}>Date and time</Text>
                    <Text style={styles.value}>
                        {new Date(match.match_date).toLocaleString("en-GB", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.label}>Players</Text>
                    <Text style={styles.playerCount}>
                        {match.participant_count}/{match.maximum_players}
                    </Text>
                </View>
            </View>

            {match.description ? (
                <View style={styles.descriptionCard}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{match.description}</Text>
                </View>
            ) : null}

            {/* PLAYER / PARTICIPATION ACTION */}
            {!isCreator ? (
                isCancelled ? (
                    <Pressable
                        disabled
                        style={[
                            styles.actionButton,
                            styles.disabledActionButton,
                        ]}
                    >
                        <Text style={styles.actionButtonText}>
                            Match Cancelled
                        </Text>
                    </Pressable>
                ) : hasJoined ? (
                    <Pressable
                        onPress={handleParticipation}
                        disabled={isUpdatingParticipation}
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.leaveButton,
                            pressed && styles.buttonPressed,
                            isUpdatingParticipation && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.actionButtonText}>
                            {isUpdatingParticipation
                                ? "Leaving..."
                                : "Leave Match"}
                        </Text>
                    </Pressable>
                ) : isFull ? (
                    <Pressable
                        disabled
                        style={[
                            styles.actionButton,
                            styles.disabledActionButton,
                        ]}
                    >
                        <Text style={styles.actionButtonText}>
                            Match Full
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={handleParticipation}
                        disabled={isUpdatingParticipation}
                        style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.buttonPressed,
                            isUpdatingParticipation && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.actionButtonText}>
                            {isUpdatingParticipation
                                ? "Joining..."
                                : "Join Match"}
                        </Text>
                    </Pressable>
                )
            ) : null}

            {isCreator ? (
                <View>
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/matches/edit/[id]",
                                params: { id: match.id },
                            })
                        }
                        style={({ pressed }) => [
                            styles.editButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.editButtonText}>
                            Edit Match
                        </Text>
                    </Pressable>

                    {match.status !== "cancelled" ? (
                        <Pressable
                            onPress={handleCancelMatch}
                            disabled={isCancelling}
                            style={({ pressed }) => [
                                styles.cancelButton,
                                pressed && styles.buttonPressed,
                                isCancelling && styles.buttonDisabled,
                            ]}
                        >
                            <Text style={styles.cancelButtonText}>
                                {isCancelling
                                    ? "Cancelling..."
                                    : "Cancel Match"}
                            </Text>
                        </Pressable>
                    ) : null}

                    <Pressable
                        onPress={handleDeleteMatch}
                        disabled={isDeleting}
                        style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.buttonPressed,
                            isDeleting && styles.buttonDisabled,
                        ]}
                    >
                        <Text style={styles.deleteButtonText}>
                            {isDeleting
                                ? "Deleting..."
                                : "Delete Match"}
                        </Text>
                    </Pressable>
                </View>
            ) : null}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        backgroundColor: "#F5F6F8"
    },

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginTop: 12,
        marginBottom: 24,
    },

    title: {
        flex: 1,
        fontSize: 30,
        fontWeight: "bold",
        color: "#111827"
    },

    statusBadge: {
        backgroundColor: "#D8F3DC",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 13,
        fontWeight: "700",
        color: "166534",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
        marginBottom: 18,
    },

    detailRow: {
        gap: 6,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },

    value: {
        fontSize: 17,
        color: "#111827",
        lineHeight: 24,
    },

    playerCount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
    },

    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 16,
    },

    descriptionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#111827"
    },

    description: {
        fontSize: 16,
        lineHeight: 24,
        color: "#4B5563",
    },

    detail: {
        fontSize: 17,
        marginBottom: 12,
    },

    feedButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
        marginTop: 20,
    },

    feedButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    actionSection: {
        marginTop: 20,
        marginBottom: 24,
    },

    actionButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#111827",
    },

    leaveButton: {
        marginTop: 20,
        backgroundColor: "#B91C1C",
    },

    removeFeedButton: {
        backgroundColor: "#B91C1C",
    },

    disabledActionButton: {
        backgroundColor: "#6B7280",
    },

    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    editButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#111827",
        backgroundColor: "#FFFFFF",
        marginTop: 12,
    },

    editButtonText: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "700",
    },

    deleteButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#B91C1C",
        backgroundColor: "#FFFFFF",
        marginTop: 12,
    },

    deleteButtonText: {
        color: "#B91C1C",
        fontSize: 16,
        fontWeight: "700",
    },

    cancelButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D97706",
        backgroundColor: "#FFFFFF",
        marginTop: 12,
    },

    cancelButtonText: {
        color: "#D97706",
        fontSize: 16,
        fontWeight: "700",
    },

    cancelledStatusBadge: {
        backgroundColor: "#FEE2E2",
        borderColor: "#DC2626",
    },

    cancelledStatusText: {
        color: "#DC2626",
    },

});