import { supabase } from "../lib/supabase";
import { CreateGroupPostInput, GroupPost, GroupPostComment, CreateGroupCommentInput } from "../types/groupPost";

async function getCurrentUserId() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    return user.id;
}

export async function getGroupPosts(
    groupId: string
): Promise<GroupPost[]> {
    const { data, error } = await supabase
        .from("group_posts")
        .select(`
            *,
            author:profiles!group_posts_author_id_fkey(
                id,
                username
            )
        `)
        .eq("group_id", groupId)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data as GroupPost[];
}

export async function createGroupPost(
    input: CreateGroupPostInput
): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
        .from("group_posts")
        .insert({
            group_id: input.groupId,
            author_id: userId,
            content: input.content.trim(),
        });

    if (error) {
        throw error;
    }
}

export async function deleteGroupPost(
    postId: string
): Promise<void> {
    const { error } = await supabase
        .from("group_posts")
        .delete()
        .eq("id", postId);

    if (error) {
        throw error;
    }
}

export async function getPostComments(
    postId: string
): Promise<GroupPostComment[]> {
    const { data, error } = await supabase
        .from("group_post_comments")
        .select(`
            *,
            author:profiles!group_post_comments_author_id_fkey(
                id,
                username
            )
        `)
        .eq("post_id", postId)
        .order("created_at", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return (data ?? []) as GroupPostComment[];
}

export async function createPostComment(
    input: CreateGroupCommentInput
): Promise<void> {
    const userId = await getCurrentUserId();

    if (!input.content.trim()) {
        throw new Error("Comment cannot be empty.")
    }

    const { error } = await supabase
        .from("group_post_comments")
        .insert({
            post_id: input.postId,
            author_id: userId,
            content: input.content.trim(),
        });

    if (error) {
        throw error;
    }
}

export async function deletePostComment(
    commentId: string
): Promise<void> {
    const { error } = await supabase
        .from("group_post_comments")
        .delete()
        .eq("id", commentId);

    if (error) {
        throw error;
    }
}