import { render, waitFor } from "@testing-library/react-native";
import React from "react";

import MatchDetailsScreen from "../app/(protected)/matches/[id]";

import {
    getMatchById,
    hasJoinedMatch,
} from "../services/matchService";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
    useLocalSearchParams: jest.fn(() => ({
        id: "match-123",
    })),
}));

jest.mock("../contexts/AuthContext", () => ({
    useAuth: jest.fn(() => ({
        user: {
            id: "normal-user-123",
        },
    })),
}));

jest.mock("@expo/vector-icons", () => ({
    Ionicons: () => null,
}));

jest.mock("../services/matchService", () => ({
    getMatchById: jest.fn(),
    hasJoinedMatch: jest.fn(),
    joinMatch: jest.fn(),
    leaveMatch: jest.fn(),
    deleteMatch: jest.fn(),
    cancelMatch: jest.fn(),
    postMatchToFeed: jest.fn(),
    removeMatchFromFeed: jest.fn(),
}));

describe("MatchDetailsScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("shows Join Match to a non-creator who has not joined", async () => {
        (getMatchById as jest.Mock).mockResolvedValue({
            id: "match-123",
            creator_id: "creator-999",
            title: "Tuesday night football",
            description: "Meet at reception",
            location: "Queens PEC",
            match_date: "2026-08-25T20:00:00.000Z",
            maximum_players: 10,
            participant_count: 2,
            status: "open",
            is_posted: true,
            posted_at: "2026-08-16T12:00:00.000Z",
            created_at: "2026-08-01T12:00:00.000Z",
            updated_at: "2026-08-01T12:00:00.000Z",
        });

        (hasJoinedMatch as jest.Mock).mockResolvedValue(false);

        const {
            getByText,
            queryByText,
        } = await render(<MatchDetailsScreen />);

        await waitFor(() => {
            expect(
                getByText("Tuesday night football")
            ).toBeTruthy();
        });

        expect(getByText("Join Match")).toBeTruthy();

        expect(queryByText("Edit Match")).toBeNull();

        expect(queryByText("Delete Match")).toBeNull();
    });

    test("shows creator controls to the match creator and hides Join Match", async () => {
        (getMatchById as jest.Mock).mockResolvedValue({
            id: "match-123",
            creator_id: "normal-user-123",
            title: "Tuesday night football",
            description: "Meet at reception",
            location: "Queens PEC",
            match_date: "2026-08-25T20:00:00.000Z",
            maximum_players: 10,
            participant_count: 2,
            status: "open",
            is_posted: true,
            posted_at: "2026-08-16T12:00:00.000Z",
            created_at: "2026-08-01T12:00:00.000Z",
            updated_at: "2026-08-01T12:00:00.000Z",
        });

        (hasJoinedMatch as jest.Mock).mockResolvedValue(false);

        const {
            getByText,
            queryByText,
        } = await render(<MatchDetailsScreen />);

        await waitFor(() => {
            expect(
                getByText("Tuesday night football")
            ).toBeTruthy();
        });

        expect(getByText("Edit Match")).toBeTruthy();
        expect(getByText("Cancel Match")).toBeTruthy();
        expect(getByText("Delete Match")).toBeTruthy();

        expect(queryByText("Join Match")).toBeNull();
    });

    test("does not allow a user to join a cancelled match", async () => {
        (getMatchById as jest.Mock).mockResolvedValue({
            id: "match-123",
            creator_id: "creator-999",
            title: "Cancelled football match",
            description: "This match has been cancelled",
            location: "Queens PEC",
            match_date: "2026-08-25T20:00:00.000Z",
            maximum_players: 10,
            participant_count: 4,
            status: "cancelled",
            is_posted: false,
            posted_at: null,
            created_at: "2026-08-01T12:00:00.000Z",
            updated_at: "2026-08-01T12:00:00.000Z",
        });

        (hasJoinedMatch as jest.Mock).mockResolvedValue(false);

        const {
            getByText,
            queryByText,
        } = await render(<MatchDetailsScreen />);

        await waitFor(() => {
            expect(
                getByText("Cancelled football match")
            ).toBeTruthy();
        });

        expect(getByText("Cancelled")).toBeTruthy();
        expect(queryByText("Join Match")).toBeNull();
    });
});

