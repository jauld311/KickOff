export type MatchStatus = "open" | "full" | "cancelled";

export type Match = {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    location: string;
    match_date: string;
    maximum_players: number;
    status: MatchStatus;
    is_posted: boolean;
    posted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type MatchWithCount = Match & {
    participant_count: number;
};

export type CreateMatchInput = {
    title: string;
    description?: string;
    location: string;
    matchDate: string;
    maximumPlayers: number;
};