export type GroupRole = "owner" | "admin" | "member";

export type GroupMemberStatus =
    | "pending"
    | "approved"
    | "rejected";

export type Group = {
    id: string;
    name: string;
    description: string | null;
    creator_id: string;
    created_at: string;
    updated_at: string;
};

export type GroupMember = {
    id: string;
    group_id: string;
    user_id: string;
    role: GroupRole;
    status: GroupMemberStatus;
    created_at: string;
};

export type CreateGroupInput = {
    name: string;
    description?: string;
};

export type GroupMemberWithProfile = GroupMember & {
    profile: {
        id: string;
        username: string;
    };
};