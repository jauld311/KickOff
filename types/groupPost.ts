export interface GroupPost {
    id: string;
    group_id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string;

    author: {
        id: string;
        username: string;
    };
}

export interface CreateGroupPostInput {
    groupId: string;
    content: string;
}

export interface GroupPostComment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;

    author: {
        id: string;
        username: string;
    };
}

export interface CreateGroupCommentInput {
    postId: string;
    content: string;
}