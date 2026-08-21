export function getPlayersNeeded(
    participantCount: number,
    maximumPlayers: number
): number {
    return Math.max(maximumPlayers - participantCount, 0);
}

export function isMatchFull(
    participantCount: number,
    maximumPlayers: number
): boolean {
    return participantCount >= maximumPlayers;
}

export function getMatchStatus(
    currentStatus: string,
    participantCount: number,
    maximumPlayers: number
): "open" | "full" | "cancelled" {
    if (currentStatus === "cancelled") {
        return "cancelled";
    }

    if (participantCount >= maximumPlayers) {
        return "full";
    }
    
    return "open";
}