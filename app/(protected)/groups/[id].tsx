import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

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
import { getMatchesByGroup, postMatchToFeed, removeMatchFromFeed } from "../../../services/matchService";

import {
    createGroupPost,
    createPostComment,
    deleteGroupPost,
    deletePostComment,
    getGroupPosts,
    getPostComments,
} from "../../../services/groupPostService";

import type { Group, GroupMember, GroupMemberWithProfile, } from "../../../types/group";
import type { GroupPost, GroupPostComment } from "../../../types/groupPost";
import type { MatchWithCount } from "../../../types/match";


export default function GroupDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [commentsByPost, setCommentsByPost] = useState<Record<string, GroupPostComment[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [postingCommentId, setPostingCommentId] = useState<string | null>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [updatingFeedMatchId, setUpdatingFeedMatchId] = useState<string | null>(null);

    const loadGroupDetails = useCallback(async () => {
        if (!id) {
            return;
        }

        try {
            setIsLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            setCurrentUserId(user?.id ?? null);

            const [
                groupResult,
                matchResults,
                memberResults,
                membershipResult,
                pendingResults,
                postResults,
            ] = await Promise.all([
                getGroupById(id),
                getMatchesByGroup(id),
                getGroupMembers(id),
                getCurrentGroupMembership(id),
                getPendingGroupRequests(id),
                getGroupPosts(id),
            ]);

            setGroup(groupResult);
            setMatches(matchResults);
            setMembers(memberResults)
            setCurrentMembership(membershipResult);
            setPendingRequests(pendingResults);
            setPosts(postResults);

            const commentResults = await Promise.all(
                postResults.map(async (post) => {
                    const comments = await getPostComments(post.id);

                    return {
                        postId: post.id,
                        comments,
                    };
                })
            );

            const commentsMap: Record<string, GroupPostComment[]> = {};

            commentResults.forEach((result) => {
                commentsMap[result.postId] = result.comments;
            });

            setCommentsByPost(commentsMap);

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

    async function handleCreatePost() {
        if (!group) {
            return;
        }

        if (!newPostContent.trim()) {
            Alert.alert(
                "Empty announcement",
                "Please enter something before posting."
            );
            return;
        }

        try {
            setIsPosting(true);

            await createGroupPost({
                groupId: group.id,
                content: newPostContent,
            });

            setNewPostContent("");

            await loadGroupDetails();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create the announcement"

            Alert.alert("Post failed", message);
        } finally {
            setIsPosting(false);
        }
    }

    function handleDeletePost(postId: string) {
        Alert.alert(
            "Delete announcement?",
            "This announcement will be permanently removed.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeletingPostId(postId);

                            await deleteGroupPost(postId);

                            await loadGroupDetails();
                        } catch (error) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : "Unable to delete the announcement"

                            Alert.alert("Delete failed", message)
                        } finally {
                            setDeletingPostId(null)
                        }
                    },
                },
            ]
        );
    }

    async function handleCreateComment(postId: string) {
        const content = commentInputs[postId] ?? "";

        if (!content.trim()) {
            Alert.alert(
                "Empty comment",
                "Please enter a comment before posting."
            );
            return;
        }

        try {
            setPostingCommentId(postId);

            await createPostComment({
                postId,
                content,
            });

            setCommentInputs((current) => ({
                ...current,
                [postId]: "",
            }));

            const updatedComments = await getPostComments(postId);

            setCommentsByPost((current) => ({
                ...current,
                [postId]: updatedComments,
            }));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to post the comment.";

            Alert.alert("Comment failed", message);
        } finally {
            setPostingCommentId(null);
        }
    }

    async function handleDeleteComment(
        commentId: string,
        postId: string
    ) {
        try {
            setDeletingCommentId(commentId);

            await deletePostComment(commentId);

            const updatedComments =
                await getPostComments(postId);

            setCommentsByPost((current) => ({
                ...current,
                [postId]: updatedComments,
            }));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to delete the comment.";

            Alert.alert("Delete failed", message);
        } finally {
            setDeletingCommentId(null);
        }
    }

    async function handleMatchFeedToggle(match: MatchWithCount) {
        try {
            setUpdatingFeedMatchId(match.id);

            if (match.is_posted) {
                await removeMatchFromFeed(match.id);
            } else {
                await postMatchToFeed(match.id);
            }

            await loadGroupDetails();
        } catch (error) {
            const message =
                error instanceof Error
                ? error.message
                : "Unable to update the match feed.";

            Alert.alert("Update failed", message);
        } finally {
            setUpdatingFeedMatchId(null);
        }
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
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={20}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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
                                        <View
                                            key={match.id}
                                            style={styles.matchCard}
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


                                            <Pressable
                                                onPress={() =>
                                                    router.push({
                                                        pathname: "/matches/[id]",
                                                        params: { id: match.id }
                                                    })
                                                }
                                                style={({ pressed }) => [
                                                    styles.viewMatchButton,
                                                    pressed && styles.buttonPressed,
                                                ]}
                                            >
                                                <Text style={styles.viewMatchButtonText}>
                                                    View Match
                                                </Text>
                                            </Pressable>

                                            {canManageGroup && match.status !== "cancelled" ? (
                                                <Pressable
                                                    onPress={() => handleMatchFeedToggle(match)}
                                                    style={({ pressed }) => [
                                                        styles.feedMatchButton,
                                                        match.is_posted && styles.removeFeedMatchButton,
                                                        pressed && styles.buttonPressed,
                                                    ]}
                                                >
                                                    <Text style={styles.feedMatchButtonText}>
                                                        {updatingFeedMatchId === match.id
                                                        ? "Updating..."
                                                        : match.is_posted
                                                            ? "Remove from Feed"
                                                            : "Post to Feed"}
                                                    </Text>
                                                </Pressable>
                                            ) : null}
                                        </View>
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

                                {canManageGroup ? (
                                    <View style={styles.newPostBox}>
                                        <TextInput
                                            value={newPostContent}
                                            onChangeText={setNewPostContent}
                                            placeholder="Post an announcement..."
                                            placeholderTextColor={"#6B7280"}
                                            multiline
                                            style={styles.postInput}
                                        />

                                        <Pressable
                                            onPress={handleCreatePost}
                                            disabled={isPosting}
                                            style={({ pressed }) => [
                                                styles.postButton,
                                                pressed && styles.buttonPressed,
                                                isPosting && styles.buttonDisabled,
                                            ]}
                                        >
                                            <Text style={styles.postButtonText}>
                                                {isPosting ? "Posting..." : "Post Announcement"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : null}

                                {posts.length === 0 ? (
                                    <Text style={styles.sectionText}>
                                        No announcements yet.
                                    </Text>
                                ) : (
                                    posts.map((post) => (
                                        <View
                                            key={post.id}
                                            style={styles.postCard}
                                        >

                                            {canManageGroup ? (
                                                <Pressable
                                                    onPress={() => handleDeletePost(post.id)}
                                                    disabled={deletingPostId === post.id}
                                                    style={({ pressed }) => [
                                                        styles.deletePostButton,
                                                        pressed && styles.buttonPressed,
                                                        deletingPostId === post.id &&
                                                        styles.buttonDisabled,
                                                    ]}
                                                >
                                                    <Text style={styles.deletePostText}>
                                                        {deletingPostId === post.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </Text>
                                                </Pressable>
                                            ) : null}

                                            <Text style={styles.postAuthor}>
                                                {post.author.username}
                                            </Text>

                                            <Text style={styles.postContent}>
                                                {post.content}
                                            </Text>

                                            <Text style={styles.postDate}>
                                                {new Date(post.created_at).toLocaleString("en-GB")}
                                            </Text>

                                            <View style={styles.commentsSection}>
                                                <Text style={styles.commentsTitle}>
                                                    Comments
                                                </Text>

                                                {(commentsByPost[post.id] ?? []).length === 0 ? (
                                                    <Text style={styles.noCommentsText}>
                                                        No comments yet.
                                                    </Text>
                                                ) : (
                                                    (commentsByPost[post.id] ?? []).map((comment) => (
                                                        <View
                                                            key={comment.id}
                                                            style={styles.commentRow}
                                                        >
                                                            {comment.author_id === currentUserId ? (
                                                                <Pressable
                                                                    onPress={() =>
                                                                        handleDeleteComment(
                                                                            comment.id,
                                                                            post.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        deletingCommentId === comment.id
                                                                    }
                                                                    style={({ pressed }) => [
                                                                        styles.deleteCommentButton,
                                                                        pressed && styles.buttonPressed,
                                                                        deletingCommentId === comment.id &&
                                                                        styles.buttonDisabled,
                                                                    ]}
                                                                >
                                                                    <Text style={styles.deleteCommentText}>
                                                                        {deletingCommentId === comment.id
                                                                            ? "Deleting..."
                                                                            : "Delete"}
                                                                    </Text>
                                                                </Pressable>
                                                            ) : null}
                                                            <Text style={styles.commentAuthor}>
                                                                {comment.author.username}
                                                            </Text>

                                                            <Text style={styles.commentContent}>
                                                                {comment.content}
                                                            </Text>

                                                            <Text style={styles.commentDate}>
                                                                {new Date(comment.created_at).toLocaleString("en-GB")}
                                                            </Text>
                                                        </View>
                                                    ))
                                                )}
                                                <View style={styles.commentInputSection}>
                                                    <TextInput
                                                        value={commentInputs[post.id] ?? ""}
                                                        onChangeText={(text) =>
                                                            setCommentInputs((current) => ({
                                                                ...current,
                                                                [post.id]: text,
                                                            }))
                                                        }
                                                        placeholder="Write a comment..."
                                                        placeholderTextColor="#6B7280"
                                                        multiline
                                                        style={styles.commentInput}
                                                    />

                                                    <Pressable
                                                        onPress={() => handleCreateComment(post.id)}
                                                        disabled={postingCommentId === post.id}
                                                        style={({ pressed }) => [
                                                            styles.commentButton,
                                                            pressed && styles.buttonPressed,
                                                            postingCommentId === post.id &&
                                                            styles.buttonDisabled,
                                                        ]}
                                                    >
                                                        <Text style={styles.commentButtonText}>
                                                            {postingCommentId === post.id
                                                                ? "Posting..."
                                                                : "Post Comment"}
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                )}
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
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 60,
    },

    screen: {
        flex: 1,
        backgroundColor: "#F5F6F8"
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

    postCard: {
        marginTop: 12,
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
    },

    postAuthor: {
        fontWeight: "700",
        fontSize: 15,
        color: "#111827",
    },

    postContent: {
        marginTop: 8,
        fontSize: 15,
        color: "#374151",
        lineHeight: 22,
    },

    postDate: {
        marginTop: 12,
        fontSize: 12,
        color: "#9CA3AF",
    },

    newPostBox: {
        marginTop: 12,
        marginBottom: 16,
    },

    postInput: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#FFFFFF",
        textAlignVertical: "top",
    },

    postButton: {
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#111827",
        marginTop: 10,
    },

    postButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    deletePostButton: {
        alignSelf: "flex-start",
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: "#B91C1C",
        borderRadius: 8,
    },

    deletePostText: {
        color: "#B91C1C",
        fontSize: 13,
        fontWeight: "700",
    },

    commentsSection: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },

    commentsTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    noCommentsText: {
        fontSize: 14,
        color: "#6B7280",
    },

    commentRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

    commentAuthor: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },

    commentContent: {
        fontSize: 14,
        color: "#374151",
        marginTop: 4,
        lineHeight: 20,
    },

    commentDate: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 5,
    },

    commentInputSection: {
        marginTop: 12,
    },

    commentInput: {
        minHeight: 70,
        padding: 10,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        color: "#111827",
        fontSize: 14,
        textAlignVertical: "top",
    },

    commentButton: {
        minHeight: 42,
        marginTop: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111827",
        borderRadius: 8,
    },

    commentButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },

    deleteCommentButton: {
        alignSelf: "flex-start",
        marginTop: 6,
    },

    deleteCommentText: {
        color: "#B91C1C",
        fontSize: 12,
        fontWeight: "700",
    },

    viewMatchButton: {
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#111827",
        marginTop: 14,
    },

    viewMatchButtonText: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "700",
    },

    feedMatchButton: {
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#111827",
        marginTop: 10,
    },

    removeFeedMatchButton: {
        backgroundColor: "#B91C1C",
    },

    feedMatchButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});