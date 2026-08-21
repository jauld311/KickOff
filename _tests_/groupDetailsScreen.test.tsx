import {
    render,
    waitFor,
} from "@testing-library/react-native";
import React from "react";

import GroupDetailsScreen from "../app/(protected)/groups/[id]";

import {
    getCurrentGroupMembership,
    getGroupById,
    getGroupMembers,
    getPendingGroupRequests,
} from "../services/groupService";

import {
    getMatchesByGroup,
} from "../services/matchService";

import {
    getGroupPosts,
} from "../services/groupPostService";

jest.mock("@expo/vector-icons", () => ({
    Ionicons: () => null,
}));

jest.mock("expo-router", () => {
    const React = require("react");

    return {
        router: {
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
        },

        useLocalSearchParams: jest.fn(() => ({
            id: "group-123",
        })),

        useFocusEffect: jest.fn((callback) => {
            React.useEffect(() => {
                callback();
            }, [callback]);
        }),
    };
});

jest.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: {
                    user: {
                        id: "member-user-123",
                    },
                },
                error: null,
            }),
        },
    },
}));

jest.mock("../services/groupService", () => ({
    getGroupById: jest.fn(),
    getGroupMembers: jest.fn(),
    getCurrentGroupMembership: jest.fn(),
    getPendingGroupRequests: jest.fn(),

    requestToJoinGroup: jest.fn(),
    approveGroupRequest: jest.fn(),
    rejectGroupRequest: jest.fn(),
    leaveGroup: jest.fn(),
    removeGroupMember: jest.fn(),
}));

jest.mock("../services/matchService", () => ({
    getMatchesByGroup: jest.fn(),
    postMatchToFeed: jest.fn(),
    removeMatchFromFeed: jest.fn(),
}));

jest.mock("../services/groupPostService", () => ({
    getGroupPosts: jest.fn(),
    getPostComments: jest.fn(),
    createGroupPost: jest.fn(),
    deleteGroupPost: jest.fn(),
    createPostComment: jest.fn(),
    deletePostComment: jest.fn(),
}));

describe("GroupDetailsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (getGroupById as jest.Mock).mockResolvedValue({
            id: "group-123",
            name: "Tuesday Football",
            description: "Weekly five-a-side group",
            creator_id: "owner-user-999",
            created_at: "2026-08-01T12:00:00.000Z",
            updated_at: "2026-08-01T12:00:00.000Z",
        });

        (getMatchesByGroup as jest.Mock).mockResolvedValue([]);

        (getGroupMembers as jest.Mock).mockResolvedValue([
            {
                id: "membership-123",
                group_id: "group-123",
                user_id: "member-user-123",
                role: "member",
                status: "approved",
                created_at: "2026-08-01T12:00:00.000Z",
                profile: {
                    id: "member-user-123",
                    username: "player1",
                },
            },
        ]);

        (getCurrentGroupMembership as jest.Mock).mockResolvedValue({
            id: "membership-123",
            group_id: "group-123",
            user_id: "member-user-123",
            role: "member",
            status: "approved",
            created_at: "2026-08-01T12:00:00.000Z",
        });

        (getPendingGroupRequests as jest.Mock).mockResolvedValue([]);

        (getGroupPosts as jest.Mock).mockResolvedValue([]);
    });

    test("approved normal member can view group content but cannot see management controls", async () => {
        const {
            getByText,
            queryByText,
        } = await render(<GroupDetailsScreen />);

        await waitFor(() => {
            expect(
                getByText("Tuesday Football")
            ).toBeTruthy();
        });

        expect(
            getByText("Tuesday Football Matches")
        ).toBeTruthy();

        expect(
            getByText("Group Feed")
        ).toBeTruthy();

        expect(
            getByText("Tuesday Football Members")
        ).toBeTruthy();

        expect(
            queryByText("Create Match")
        ).toBeNull();

        expect(
            queryByText("Post Announcement")
        ).toBeNull();

        expect(
            queryByText("Approve")
        ).toBeNull();

        expect(
            queryByText("Reject")
        ).toBeNull();
    });

    test("shows management controls to the group owner", async () => {
        (getCurrentGroupMembership as jest.Mock).mockResolvedValue({
            id: "membership-owner",
            group_id: "group-123",
            user_id: "owner-user-999",
            role: "owner",
            status: "approved",
            created_at: "2026-08-01T12:00:00.000Z",
        });

        (getGroupMembers as jest.Mock).mockResolvedValue([
            {
                id: "membership-owner",
                group_id: "group-123",
                user_id: "owner-user-999",
                role: "owner",
                status: "approved",
                created_at: "2026-08-01T12:00:00.000Z",
                profile: {
                    id: "owner-user-999",
                    username: "owner1",
                },
            },
            {
                id: "membership-member",
                group_id: "group-123",
                user_id: "member-user-123",
                role: "member",
                status: "approved",
                created_at: "2026-08-02T12:00:00.000Z",
                profile: {
                    id: "member-user-123",
                    username: "player1",
                },
            },
        ]);

        (getPendingGroupRequests as jest.Mock).mockResolvedValue([
            {
                id: "pending-membership-123",
                group_id: "group-123",
                user_id: "pending-user-123",
                role: "member",
                status: "pending",
                created_at: "2026-08-03T12:00:00.000Z",
                profile: {
                    id: "pending-user-123",
                    username: "newplayer",
                },
            },
        ]);

        const {
            getByText,
            queryByText,
        } = await render(<GroupDetailsScreen />);

        await waitFor(() => {
            expect(
                getByText("Tuesday Football")
            ).toBeTruthy();
        });

        expect(getByText("Create Match")).toBeTruthy();

        expect(
            getByText("Post Announcement")
        ).toBeTruthy();

        expect(
            getByText("Pending Requests")
        ).toBeTruthy();

        expect(getByText("newplayer")).toBeTruthy();

        expect(getByText("Approve")).toBeTruthy();
        expect(getByText("Reject")).toBeTruthy();

        expect(
            queryByText("Request to Join")
        ).toBeNull();
    });
});