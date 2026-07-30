export type MatchStatus = "open" | "full" | "cancelled";

export type Match = {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    location: string;
    match_date: string;
    maximum_players: number;
    satus: MatchStatus;
    created_at: string;
    updated_at: string;
};

export type CreateMatchInput = {
    title: string;
    description?: string;
    location: string;
    matchDate: string;
    maximumPlayers: number;
};