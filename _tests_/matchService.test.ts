import { supabase } from "../lib/supabase";
import { joinMatch, leaveMatch } from "../services/matchService";

jest.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(),
    },
}));

describe("joinMatch", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("adds the current user to the match", async () => {
        const mockUserId = "user-123";
        const mockMatchId = "match-456";

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

        await joinMatch(mockMatchId);

        expect(supabase.from).toHaveBeenCalledWith(
            "match_participants"
        );

        expect(insertMock).toHaveBeenCalledWith({
            match_id: mockMatchId,
            user_id: mockUserId,
        });
    });
});

test("throws an error when joining a match fails", async () => {
    const mockUserId = "user-123";
    const mockMatchId = "match-456";

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
            message: "Unable to join match",
        },
    });

    (supabase.from as jest.Mock).mockReturnValue({
        insert: insertMock,
    });

    await expect(
        joinMatch(mockMatchId)
    ).rejects.toThrow("Unable to join match");
});

describe("leaveMatch", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("removes the current user from the match", async () => {
        const mockUserId = "user-123";
        const mockMatchId = "match-456";

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

        await leaveMatch(mockMatchId);

        expect(supabase.from).toHaveBeenCalledWith(
            "match_participants"
        );

        expect(deleteMock).toHaveBeenCalled();

        expect(firstEqMock).toHaveBeenCalledWith(
            "match_id",
            mockMatchId
        );

        expect(secondEqMock).toHaveBeenCalledWith(
            "user_id",
            mockUserId
        );
    });
});

test("throws an error when leaving a match fails", async () => {
    const mockUserId = "user-123";
    const mockMatchId = "match-456";

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
            message: "Unable to leave match",
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
        leaveMatch(mockMatchId)
    ).rejects.toThrow("Unable to leave match");
});