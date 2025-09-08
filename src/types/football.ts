// Types
export interface Outcome {
    name: string;
    price: number;
    point?: number; // only spreads/totals include a point
}

export interface Market {
    key: "h2h" | "spreads" | "totals";
    last_update: string;
    outcomes: Outcome[];
}

export interface Bookmaker {
    key: string;
    title: string;
    last_update: string;
    markets: Market[];
}

export interface Game {
    id: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    fanduel: Bookmaker;
}

export interface SimplifiedGame {
    id: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmaker: string;
    spread_favorite: string;
    spread_points: number;
}

export function convertGameToSimplified(game: Game): SimplifiedGame {
    const spreadMarket = game.fanduel.markets.find(m => m.key === "spreads");

    if (!spreadMarket) {
        throw new Error("Spread market not found");
    }

    const favoriteOutcome = spreadMarket.outcomes.find(o => o.point === spreadMarket.outcomes[0].point);
    const underdogOutcome = spreadMarket.outcomes.find(o => o.point === spreadMarket.outcomes[1].point);

    if (!favoriteOutcome || !underdogOutcome) {
        throw new Error("Favorite or underdog outcome not found");
    }

    return {
        id: game.id,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        bookmaker: game.fanduel.title,
        spread_favorite: favoriteOutcome.name,
        spread_points: favoriteOutcome.point!
    };
}

// Object
export const exampleGame: Game = {
    id: "dee0a41ed5e8201a96d457899adbe918",
    commence_time: "2025-09-08T00:22:53Z",
    home_team: "Buffalo Bills",
    away_team: "Baltimore Ravens",
    fanduel: {
        key: "fanduel",
        title: "FanDuel",
        last_update: "2025-09-08T00:26:07Z",
        markets: [
            {
                key: "h2h",
                last_update: "2025-09-08T00:26:07Z",
                outcomes: [
                    { name: "Baltimore Ravens", price: -125 },
                    { name: "Buffalo Bills", price: -102 }
                ]
            },
            {
                key: "spreads",
                last_update: "2025-09-08T00:26:07Z",
                outcomes: [
                    { name: "Baltimore Ravens", price: -110, point: -1.5 },
                    { name: "Buffalo Bills", price: -120, point: 1.5 }
                ]
            },
            {
                key: "totals",
                last_update: "2025-09-08T00:26:07Z",
                outcomes: [
                    { name: "Over", price: -118, point: 51.5 },
                    { name: "Under", price: -112, point: 51.5 }
                ]
            }
        ]
    }
};
