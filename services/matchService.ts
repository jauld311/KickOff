import { supabase } from "../lib/supabase";
import { CreateMatchInput, Match } from "../types/match";

async function getCurrentUserId() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!user) {
        throw new Error("User not found");
    }
    console.log("Current user ID:", user.id);
    return user.id;
}

export async function createMatch(
    input: CreateMatchInput
): Promise<Match> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
    .from("matches")
    .insert({
        creator_id: userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        location: input.location.trim(),
        match_date: input.matchDate,
        maximum_players: input.maximumPlayers,
        status: "open",
    })
    .select()
    .single();

    if (error) {
        throw error;
    }

    return data as Match;
}

export async function getJoinedMatches(): Promise<Match[]> {
    const userId = await getCurrentUserId();

    const { data: participantData, error: participantError } =
        await supabase
            .from("match_participants")
            .select("match_id")
            .eq("user_id", userId);

    if (participantError) {
        throw participantError;
    }

    const matchIds = (participantData ?? []).map(
        (participant) => participant.match_id
    );

    if (matchIds.length === 0) {
        return [];
    }

    const { data: matchData, error: matchError } = 
        await supabase
            .from("matches")
            .select("*")
            .in("id", matchIds)
            .order("match_date", { ascending: true});

        if (matchError) {
            throw matchError;
        }

        return (matchData ?? []) as Match[];
}


export async function joinMatch(matchId: string): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
    .from("match_participants")
    .insert({
        match_id: matchId,
        user_id: userId,
    });

    if (error) {
        throw error;
    }
}

export async function leaveMatch(matchId: string): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
    .from("match_participants")
    .delete()
    .eq("match_id", matchId)
    .eq("user_id", userId);

    if (error) {
        throw error;
    }
}