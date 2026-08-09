import { supabase } from "../lib/supabase";
import type {
    CreateGroupInput,
    Group,
    GroupMember,
    GroupMemberWithProfile,
} from "../types/group";

async function getCurrentUserId(): Promise<string> {
    const {
        data: {user},
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error (error.message);
    }

    if (!user) {
        throw new Error("You must be logged in.")
    }

    return user.id;
}

export async function createGroup(
    input: CreateGroupInput
) : Promise<Group> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("groups")
        .insert({
            name: input.name.trim(),
            description: input.description?.trim() || null,
            creator_id: userId,
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Group;
}

export async function getMyGroups(): Promise<Group[]> {
    const userId = await getCurrentUserId();

    const { data: membershipData, error: membershipError } =
        await supabase
            .from("group_members")
            .select("group_id")
            .eq("user_id", userId)
            .eq("status", "approved");

    if (membershipError) {
        throw new Error(membershipError.message);
    }

    const groupIds = (membershipData ?? []).map(
        (membership) => membership.group_id
    );

    if (groupIds.length === 0) {
        return [];
    }

    const { data: groupData, error: groupError } =
        await supabase
            .from("groups")
            .select("*")
            .in("id", groupIds)
            .order("name", { ascending: true });

    if (groupError) {
        throw new Error(groupError.message);
    }

    return (groupData ?? []) as Group[];
}
export async function getGroupById(
    groupId: string
) : Promise<Group> {
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data as Group;
}

export async function getGroupMembers(
    groupId: string
): Promise<GroupMemberWithProfile[]> {
    const { data, error } = await supabase
        .from("group_members")
        .select(`
            *,
            profile:profiles!group_members_user_id_fkey (
                id,
                username
            )
        `)
        .eq("group_id", groupId)
        .eq("status", "approved")
        .order("created_at", {ascending: true});

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as GroupMemberWithProfile[];   
}

export async function getCurrentGroupMembership(
    groupId: string
): Promise<GroupMember | null>{
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data as GroupMember | null;
}

export async function requestToJoinGroup(

groupId: string
): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
        .from("group_members")
        .insert({
            group_id: groupId,
            user_id: userId,
            role: "member",
            status: "pending",
        });

    if (error) {
        throw new Error(error.message);
    }
}

export async function getPendingGroupRequests(
    groupId: string
): Promise<GroupMemberWithProfile[]> {
    const { data, error } = await supabase
        .from("group_members")
        .select(`
            *,
            profile:profiles!group_members_user_id_fkey (
                id,
                username
            )
        `)
        .eq("group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as GroupMemberWithProfile[];
}

export async function approveGroupRequest(
    membershipId: string
): Promise<void> {
    const { error } = await supabase
        .from("group_members")
        .update({
            status: "approved",
        })
        .eq("id", membershipId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function rejectGroupRequest(
    membershipId: string
): Promise<void> {
    const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", membershipId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function getAvailableGroups(): Promise<Group[]> {
    const userId = await getCurrentUserId();

    const { data: memberships, error: membershipError } =
        await supabase
            .from("group_members")
            .select("group_id")
            .eq("user_id", userId);

    if (membershipError) {
        throw new Error(membershipError.message);
    }

    const joinedGroupIds = (memberships ?? []).map(
        (membership) => membership.group_id
    );

    let query = supabase
        .from("groups")
        .select("*")
        .order("name", { ascending: true });

    if (joinedGroupIds.length > 0) {
        query = query.not(
            "id",
            "in",
            `(${joinedGroupIds.join(",")})`
        );
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message)
    }

    return (data ?? []) as Group[];
}

export async function leaveGroup(
    groupId: string
): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId)

    if (error) {
        throw new Error(error.message);
    }
}

export async function removeGroupMember(
    membershipId: string
): Promise<void> {
    const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", membershipId);

    if (error) {
        throw new Error(error.message)
    }
}