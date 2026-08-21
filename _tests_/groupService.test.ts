import {
    approveGroupRequest,
    leaveGroup,
    rejectGroupRequest,
    removeGroupMember,
    requestToJoinGroup,
} from "../services/groupService";

import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}));

describe("Group service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("requests to join a group with pending member status", async () => {
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

        await requestToJoinGroup(mockGroupId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_members"
        );

        expect(insertMock).toHaveBeenCalledWith({
            group_id: mockGroupId,
            user_id: mockUserId,
            role: "member",
            status: "pending",
        });
    });

    test("throws an error when requesting to join a group fails", async () => {
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
        error: {
            message: "Unable to request group membership",
        },
    });

    (supabase.from as jest.Mock).mockReturnValue({
        insert: insertMock,
    });

    await expect(
        requestToJoinGroup(mockGroupId)
    ).rejects.toThrow("Unable to request group membership");
});

    test("approves a pending group request", async () => {
        const membershipId = "membership-123";

        const eqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const updateMock = jest.fn().mockReturnValue({
            eq: eqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: updateMock,
        });

        await approveGroupRequest(membershipId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_members"
        );

        expect(updateMock).toHaveBeenCalledWith({
            status: "approved",
        });

        expect(eqMock).toHaveBeenCalledWith(
            "id",
            membershipId
        );
    });

    test("throws an error when approving a group request fails", async () => {
    const membershipId = "membership-123";

    const eqMock = jest.fn().mockResolvedValue({
        error: {
            message: "Unable to approve request",
        },
    });

    const updateMock = jest.fn().mockReturnValue({
        eq: eqMock,
    });

    (supabase.from as jest.Mock).mockReturnValue({
        update: updateMock,
    });

    await expect(
        approveGroupRequest(membershipId)
    ).rejects.toThrow("Unable to approve request");
});

    test("rejects a pending group request", async () => {
        const membershipId = "membership-123";

        const eqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({
            eq: eqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        await rejectGroupRequest(membershipId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_members"
        );

        expect(deleteMock).toHaveBeenCalled();

        expect(eqMock).toHaveBeenCalledWith(
            "id",
            membershipId
        );
    });

    test("allows the current user to leave a group", async () => {
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

        const secondEqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const firstEqMock = jest.fn().mockReturnValue({
            eq: secondEqMock,
        });

        const deleteMock = jest.fn().mockReturnValue({
            eq: firstEqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        await leaveGroup(mockGroupId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_members"
        );

        expect(firstEqMock).toHaveBeenCalledWith(
            "group_id",
            mockGroupId
        );

        expect(secondEqMock).toHaveBeenCalledWith(
            "user_id",
            mockUserId
        );
    });

    test("throws an error when leaving a group fails", async () => {
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

    const secondEqMock = jest.fn().mockResolvedValue({
        error: {
            message: "Unable to leave group",
        },
    });

    const firstEqMock = jest.fn().mockReturnValue({
        eq: secondEqMock,
    });

    const deleteMock = jest.fn().mockReturnValue({
        eq: firstEqMock,
    });

    (supabase.from as jest.Mock).mockReturnValue({
        delete: deleteMock,
    });

    await expect(
        leaveGroup(mockGroupId)
    ).rejects.toThrow("Unable to leave group");
});

    test("removes a member from a group", async () => {
        const membershipId = "membership-123";

        const eqMock = jest.fn().mockResolvedValue({
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({
            eq: eqMock,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        await removeGroupMember(membershipId);

        expect(supabase.from).toHaveBeenCalledWith(
            "group_members"
        );

        expect(deleteMock).toHaveBeenCalled();

        expect(eqMock).toHaveBeenCalledWith(
            "id",
            membershipId
        );
    });
});