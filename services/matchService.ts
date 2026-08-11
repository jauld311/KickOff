import { supabase } from "../lib/supabase";
import { CreateMatchInput, Match, MatchWithCount, UpdateMatchInput } from "../types/match";

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

function mapMatchWithCount(match: any): MatchWithCount {
    return {
        ...match,
        participant_count:
            match.match_participants?.[0]?.count ?? 0,
    };
}

export async function createMatch(
    input: CreateMatchInput
): Promise<Match> {
    const userId = await getCurrentUserId();

    const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
            creator_id: userId,
            group_id: input.groupId,
            title: input.title.trim(),
            description: input.description?.trim() || null,
            location: input.location.trim(),
            match_date: input.matchDate,
            maximum_players: input.maximumPlayers,
            status: "open",
        })
        .select()
        .single();

    if (matchError) {
        throw new Error(matchError.message);
    }

    const { error: participantError } = await supabase
        .from("match_participants")
        .insert({
            match_id: match.id,
            user_id: userId,
        });

    if (participantError) {
        throw new Error(participantError.message);
    }

    return match as Match;
}

export async function getCreatedMatches(): Promise<MatchWithCount[]> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("matches")
        .select(`*
            *,
            match_participants(count)
            `)
        .eq("creator_id", userId)
        .order("match_date", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map(mapMatchWithCount);;
}

export async function getJoinedMatches(): Promise<MatchWithCount[]> {
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
            .select(`
            *,
            match_participants(count)
            `)
            .in("id", matchIds)
            .order("match_date", { ascending: true });

    if (matchError) {
        throw matchError;
    }

    return (matchData ?? []).map(mapMatchWithCount);
}

export async function getMatchById(
    matchId: string
): Promise<MatchWithCount> {
    const { data, error } = await supabase
        .from("matches")
        .select(`
            *,
            match_participants(count)
        `)
        .eq("id", matchId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return mapMatchWithCount(data);
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
        throw new Error(error.message);
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
        throw new Error(error.message);
    }
}

export async function updateMatch(
    matchId: string,
    input: UpdateMatchInput
): Promise<Match> {
    const { data, error } = await supabase
        .from("matches")
        .update({
            title: input.title.trim(),
            description: input.description?.trim() || null,
            location: input.location.trim(),
            match_date: input.matchDate,
            maximum_players: input.maximumPlayers,
            updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single()

    if (error) {
        throw new Error(error.message);
    }

    return data as Match;
}

export async function deleteMatch(matchId: string): Promise<void> {
    const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function getParticipantCount(
    matchId: string
): Promise<number> {
    const { count, error } = await supabase
        .from("match_participants")
        .select("*", { count: "exact", head: true, })
        .eq("match_id", matchId);

    if (error) {
        throw new Error(error.message);
    }

    return count ?? 0;
}

export async function cancelMatch(matchId: string): Promise<void> {
    const { error } = await supabase
        .from("matches")
        .update({
            status: "cancelled",
            is_posted: false,
            posted_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", matchId);

    if (error) {
        throw new Error(error.message)
    }
}
export async function postMatchToFeed(matchId: string): Promise<void> {
    const { error } = await supabase
        .from("matches")
        .update({
            is_posted: true,
            posted_at: new Date().toISOString(),
        })
        .eq("id", matchId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function removeMatchFromFeed(
    matchId: string
): Promise<void> {
    const { error } = await supabase
        .from("matches")
        .update({
            is_posted: false,
            posted_at: null,
        })
        .eq("id", matchId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function getPostedMatches(): Promise<MatchWithCount[]> {
    const { data, error } = await supabase
        .from("matches")
        .select(`
      *,
      match_participants(count)
    `)
        .eq("is_posted", true)
        .neq("status", "cancelled")
        .gte("match_date", new Date().toISOString())
        .order("match_date", { ascending: true });


    console.log("Posted matches result:", data);
    console.log("Posted matches error:", error);

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map(mapMatchWithCount);
}

export async function hasJoinedMatch(
    matchId: string
): Promise<boolean> {
    const userId = await getCurrentUserId();

    const { count, error } = await supabase
        .from("match_participants")
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("match_id", matchId)
        .eq("user_id", userId);

    if (error) {
        throw new Error(error.message);
    }

    return (count ?? 0) > 0;
}

export async function getMatchesByGroup(
    groupId: string
) : Promise<MatchWithCount[]> {
        const { data, error } = await supabase
            .from("matches")
            .select(`
            *,
            match_participants(count)
        `)
        .eq("group_id", groupId)
        .order("match_date", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map(mapMatchWithCount);
}
