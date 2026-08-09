import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    approveGroupRequest,
    getCurrentGroupMembership,
    getGroupById,
    getGroupMembers,
    getPendingGroupRequests,
    leaveGroup,
    rejectGroupRequest,
    removeGroupMember,
    requestToJoinGroup,
} from "../../../services/groupService";
import { getMatchesByGroup } from "../../../services/matchService";

import type { Group, GroupMember, GroupMemberWithProfile, } from "../../../types/group";
import type { MatchWithCount } from "../../../types/match";


export default function GroupDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [matches, setMatches] = useState<MatchWithCount[]>([]);
    const [members, setMembers] = useState<GroupMemberWithProfile[]>([]);
    const [currentMembership, setCurrentMembership] = useState<GroupMember | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<GroupMemberWithProfile[]>([]);
    const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    const loadGroupDetails = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            setIsLoading(true);

            const [
                groupResult,
                matchResults,
                memberResults,
                membershipResult,
                pendingResults,
            ] = await Promise.all([
                getGroupById(id),
                getMatchesByGroup(id),
                getGroupMembers(id),
                getCurrentGroupMembership(id),
                getPendingGroupRequests(id),
            ]);

            setGroup(groupResult);
            setMatches(matchResults);
            setMembers(memberResults)
            setCurrentMembership(membershipResult);
            setPendingRequests(pendingResults);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to load the group.";

            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            loadGroupDetails();
        }, [loadGroupDetails])
    );

    async function handleJoinRequest() {
        if (!group) {
            return;
        }

        try {
            setIsRequesting(true);

            await requestToJoinGroup(group.id);

            const membership =
                await getCurrentGroupMembership(group.id);

            setCurrentMembership(membership);

            Alert.alert(
                "Request sent",
                "The group organiser will review your request."
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to send the request."

            Alert.alert("Request failed.", message);
        } finally {
            setIsRequesting(false);
        }
    }

    const canManageGroup =
        currentMembership?.role === "owner" ||
        currentMembership?.role === "admin";

    const isApprovedMember =
        currentMembership?.status === "approved";

    async function handleApproveRequest(membershipId: string) {
        try {
            setUpdatingRequestId(membershipId);

            await approveGroupRequest(membershipId);

            await loadGroupDetails();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to approve the request. Try again."

            Alert.alert("Approval failed", message);
        } finally {
            setUpdatingRequestId(null);
        }
    }

    async function handleRejectRequest(membershipId: string) {
        try {
            setUpdatingRequestId(membershipId);

            await rejectGroupRequest(membershipId);

            await loadGroupDetails();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to reject the request.";

            Alert.alert("Rejection failed", message);
        } finally {
            setUpdatingRequestId(null)
        }
    }

    async function handleLeaveGroup() {
        if (!group) {
            return;
        }

        Alert.alert(
            "Leave group?",
            "You'll need to request to join again if you want back in!",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLeaving(true);

                            await leaveGroup(group.id);

                            await loadGroupDetails();
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Unable to leave the group.";

                            Alert.alert(
                                "leave failed",
                                message
                            );
                        } finally {
                            setIsLeaving(false);
                        }
                    },
                },
            ]
        );
    }

    function handleRemoveMember(
        membershipId: string,
        username: string
    ) {
        Alert.alert(
            "Remove member?",
            `Remove ${username} from this group?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setRemovingMemberId(membershipId);

                            await removeGroupMember(membershipId);

                            await loadGroupDetails();
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Unable to remove the member.";

                            Alert.alert(
                                "Remove failed",
                                message
                            );
                        } finally {
                            setRemovingMemberId(null);
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

    if (!group) {
        return (
            <View style={styles.centered}>
                <Text>Group not found.</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{group.name}</Text>

            {group.description ? (
                <Text style={styles.description}>
                    {group.description}
                </Text>
            ) : (
                <Text style={styles.description}>
                    No group description has been added.
                </Text>
            )}

            {isApprovedMember && !canManageGroup ? (
                <Pressable
                    onPress={handleLeaveGroup}
                    disabled={isLeaving}
                    style={({ pressed }) => [
                        styles.leaveGroupButton,
                        pressed && styles.buttonPressed,
                        isLeaving && styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.leaveGroupButtonText}>
                        {isLeaving ? "Leaving..." : "Leave Group"}
                    </Text>
                </Pressable>
            ) : null}

            {!currentMembership ? (
                <Pressable
                    onPress={handleJoinRequest}
                    disabled={isRequesting}
                    style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.buttonPressed,
                        isRequesting && styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.primaryButtonText}>
                        {isRequesting
                            ? "Sending request"
                            : "Request to Join"}
                    </Text>
                </Pressable>
            ) : currentMembership.status === "pending" ? (
                <View style={styles.pendingBox}>
                    <Text style={styles.pendingText}>
                        Membership request pending
                    </Text>
                </View>
            ) : null}

            {isApprovedMember ? (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {group.name} Matches
                        </Text>

                        {matches.length === 0 ? (
                            <Text style={styles.sectionText}>
                                No matches have been created for this group yet.
                            </Text>
                        ) : (
                            matches.map((match) => (
                                <Pressable
                                    key={match.id}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/matches/[id]",
                                            params: { id: match.id },
                                        })
                                    }
                                    style={({ pressed }) => [
                                        styles.matchCard,
                                        pressed && styles.buttonPressed,
                                    ]}
                                >
                                    <View style={styles.matchHeader}>
                                        <Text style={styles.matchTitle}>
                                            {match.title}
                                        </Text>

                                        <Text style={styles.playerCount}>
                                            {match.participant_count}/{match.maximum_players}
                                        </Text>
                                    </View>

                                    <Text style={styles.matchInfo}>
                                        {match.location}
                                    </Text>

                                    <Text style={styles.matchInfo}>
                                        {new Date(match.match_date).toLocaleString("en-GB", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </Pressable>
                            ))
                        )}

                        {canManageGroup ? (
                            <Pressable
                                onPress={() =>
                                    router.push({
                                        pathname: "/create-match",
                                        params: { groupId: group.id },
                                    })
                                }
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed && styles.buttonPressed,
                                ]}
                            >
                                <Text style={styles.primaryButtonText}>
                                    Create Match
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Group Feed
                        </Text>

                        <Text style={styles.sectionText}>
                            Group announcements will appear here.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {group.name} Members
                        </Text>

                        {members.length === 0 ? (
                            <Text style={styles.sectionText}>
                                No approved members yet.
                            </Text>
                        ) : (
                            members.map((member) => (
                                <View
                                    key={member.id}
                                    style={styles.memberRow}
                                >
                                    <View>
                                        <Text style={styles.memberName}>
                                            {member.profile.username}
                                        </Text>

                                        <Text style={styles.memberRole}>
                                            {member.role.charAt(0).toUpperCase() +
                                                member.role.slice(1)}
                                        </Text>
                                    </View>


                                    {canManageGroup && member.role === "member" ? (
                                        <Pressable
                                            onPress={() =>
                                                handleRemoveMember(
                                                    member.id,
                                                    member.profile.username
                                                )
                                            }
                                            disabled={
                                                removingMemberId === member.id
                                            }
                                            style={({ pressed }) => [
                                                styles.removeMemberButton,
                                                pressed && styles.buttonPressed,
                                                removingMemberId === member.id &&
                                                styles.buttonDisabled,
                                            ]}
                                        >
                                            <Text style={styles.removeMemberText}>
                                                {removingMemberId === member.id
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ))
                        )}

                        {canManageGroup && pendingRequests.length > 0 ? (
                            <View style={styles.pendingSection}>
                                <Text style={styles.pendingTitle}>
                                    Pending Requests
                                </Text>

                                {pendingRequests.map((request) => (
                                    <View
                                        key={request.id}
                                        style={styles.pendingRow}
                                    >
                                        <View style={styles.pendingUser}>
                                            <Text style={styles.memberName}>
                                                {request.profile.username}
                                            </Text>

                                            <Text style={styles.memberRole}>
                                                Request pending
                                            </Text>
                                        </View>

                                        <View style={styles.requestButtons}>
                                            <Pressable
                                                onPress={() =>
                                                    handleApproveRequest(request.id)
                                                }
                                                disabled={updatingRequestId === request.id}
                                                style={({ pressed }) => [
                                                    styles.approveButton,
                                                    pressed && styles.buttonPressed,
                                                    updatingRequestId === request.id &&
                                                    styles.buttonDisabled,
                                                ]}
                                            >
                                                <Text style={styles.approveButtonText}>
                                                    Approve
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={() =>
                                                    handleRejectRequest(request.id)
                                                }
                                                disabled={updatingRequestId === request.id}
                                                style={({ pressed }) => [
                                                    styles.rejectButton,
                                                    pressed && styles.buttonPressed,
                                                    updatingRequestId === request.id &&
                                                    styles.buttonDisabled,
                                                ]}
                                            >
                                                <Text style={styles.rejectButtonText}>
                                                    Reject
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>
                </>
            ) : null}
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6F8",
        paddingHorizontal: 20,
    },

    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#111827",
        marginTop: 12,
        marginBottom: 10,
    },

    description: {
        fontSize: 16,
        lineHeight: 23,
        color: "#4B5563",
        marginBottom: 22,
    },

    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    sectionText: {
        fontSize: 15,
        lineHeight: 21,
        color: "#6B7280",
    },

    primaryButton: {
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111827",
        borderRadius: 10,
        marginTop: 16,
    },

    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    buttonPressed: {
        opacity: 0.8,
    },

    matchCard: {
        backgroundColor: "#F5F6F8",
        borderRadius: 10,
        padding: 14,
        marginTop: 12,
    },

    matchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },

    matchTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },

    playerCount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },

    matchInfo: {
        fontSize: 14,
        color: "#4B5563",
        marginTop: 6,
    },

    memberRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

    memberName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },

    memberRole: {
        marginTop: 3,
        fontSize: 13,
        color: "#6B7280",
    },

    pendingBox: {
        backgroundColor: "#FEF3C7",
        borderRadius: 10,
        padding: 14,
        marginBottom: 18,
    },

    pendingText: {
        color: "#92400E",
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    pendingSection: {
        marginTop: 20,
    },

    pendingTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    pendingRow: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },

    pendingUser: {
        marginBottom: 10,
    },

    requestButtons: {
        flexDirection: "row",
        gap: 10,
    },

    approveButton: {
        flex: 1,
        minHeight: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#166534",
    },

    approveButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    rejectButton: {
        flex: 1,
        minHeight: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#B91C1C",
        backgroundColor: "#FFFFFF",
    },

    rejectButtonText: {
        color: "#B91C1C",
        fontWeight: "700",
    },

    leaveGroupButton: {
        marginTop: 16,
        marginBottom: 20,
        minHeight: 52,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#B91C1C",
        backgroundColor: "#FFFFFF",
    },

    leaveGroupButtonText: {
        color: "#B91C1C",
        fontSize: 16,
        fontWeight: "700",
    },

    memberDetails: {
        flex: 1,
    },

    removeMemberButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#B91C1C",
        borderRadius: 8,
    },

    removeMemberText: {
        color: "#B91C1C",
        fontSize: 14,
        fontWeight: "700",
    },
});