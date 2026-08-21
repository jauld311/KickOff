import {
    getPlayersNeeded,
    isMatchFull,
    getMatchStatus,
} from "../utils/matchUtils";

describe("Match utilities", () => {
    describe("getPlayersNeeded", () => {
        test("calculates remaining spaces in a match", () => {
            expect(getPlayersNeeded(2, 10)).toBe(8);
        });

        test("returns zero when a match is full", () => {
            expect(getPlayersNeeded(10, 10)).toBe(0);
        });

        test("never returns a negative number", () => {
            expect(getPlayersNeeded(11, 10)).toBe(0);
        });
    });

    describe("isMatchFull", () => {
        test("returns false when spaces are available", () => {
            expect(isMatchFull(8, 10)).toBe(false);
        });

        test("returns true when the maximum is reached", () => {
            expect(isMatchFull(10, 10)).toBe(true);
        });

        test("returns true if participant count exceeds the maximum", () => {
            expect(isMatchFull(11, 10)).toBe(true);
        });
    });

    describe("getMatchStatus", () => {
        test("returns open when spaces are available", () => {
            expect(getMatchStatus("open", 6, 10)).toBe("open");
        });

        test("returns full when maximum players is reached", () => {
            expect(getMatchStatus("open", 10, 10)).toBe("full");
        });

        test("returns full when participant count exceeds maximum", () => {
            expect(getMatchStatus("open", 11, 10)).toBe("full");
        });

        test("keeps a cancelled match cancelled even when spaces are available", () => {
            expect(getMatchStatus("cancelled", 6, 10)).toBe("cancelled");
        });

        test("keeps a cancelled match cancelled even when it is full", () => {
            expect(getMatchStatus("cancelled", 10, 10)).toBe("cancelled");
        });
    });
});