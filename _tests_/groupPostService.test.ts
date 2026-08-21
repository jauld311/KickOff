import {
    createGroupPost,
    createPostComment,
    deleteGroupPost,
    deletePostComment,
} from "../services/groupPostService";

import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}));

describe("Group post service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("creates a group post with the current user as author", async () => {
        const mockUserId = "user-123";
        const mockGroupId = "group-456";

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    id: mockUserId,
                },
            },
            error: null,
        });

        const insertMock = jest.fn().mockResolvedValue({
            error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        await createGroupPost({
            groupId: mockGroupId,
            content: "  Training cancelled tonight  ",
        });

        expect(supabase.from).toHaveBeenCalledWith(
            "group_posts"
        );

        expect(insertMock).toHaveBeenCalledWith({
            group_id: mockGroupId,
            author_id: mockUserId,
            content: "Training cancelled tonight",
        });
    });

    test("deletes a group post by id", async () => {
        const postId = "post-123";

        const eqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({
            eq: eqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        await deleteGroupPost(postId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_posts"
        );

        expect(deleteMock).toHaveBeenCalled();

        expect(eqMock).toHaveBeenCalledWith(
            "id",
            postId
        );
    });

    test("creates a comment with the current user as author", async () => {
        const mockUserId = "user-123";
        const postId = "post-456";

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    id: mockUserId,
                },
            },
            error: null,
        });

        const insertMock = jest.fn().mockResolvedValue({
            error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        await createPostComment({
            postId,
            content: "  Sounds good  ",
        });

        expect(supabase.from).toHaveBeenCalledWith(
            "group_post_comments"
        );

        expect(insertMock).toHaveBeenCalledWith({
            post_id: postId,
            author_id: mockUserId,
            content: "Sounds good",
        });
    });

    test("rejects an empty comment", async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    id: "user-123",
                },
            },
            error: null,
        });

        await expect(
            createPostComment({
                postId: "post-456",
                content: "   ",
            })
        ).rejects.toThrow("Comment cannot be empty.");

        expect(supabase.from).not.toHaveBeenCalled();
    });

    test("deletes a comment by id", async () => {
        const commentId = "comment-123";

        const eqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({
            eq: eqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        await deletePostComment(commentId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_post_comments"
        );

        expect(deleteMock).toHaveBeenCalled();

        expect(eqMock).toHaveBeenCalledWith(
            "id",
            commentId
        );
    });

    test("throws an error when creating a group post fails", async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    id: "user-123",
                },
            },
            error: null,
        });

        const insertMock = jest.fn().mockResolvedValue({
            error: {
                message: "Unable to create post",
            },
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        await expect(
            createGroupPost({
                groupId: "group-456",
                content: "Training tonight",
            })
        ).rejects.toThrow("Unable to create post");
    });

    test("throws an error when creating a comment fails", async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: {
                user: {
                    id: "user-123",
                },
            },
            error: null,
        });

        const insertMock = jest.fn().mockResolvedValue({
            error: {
                message: "Unable to create comment",
            },
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        await expect(
            createPostComment({
                postId: "post-456",
                content: "I'll be there",
            })
        ).rejects.toThrow("Unable to create comment");
    });
});