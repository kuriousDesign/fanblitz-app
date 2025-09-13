// Types
import { MatchupClientType } from "@/models/Matchup";

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

export enum Sports {
    NFL = "americanfootball_nfl",
    NCAA_FOOTBALL = "americanfootball_ncaaf",
}

export interface GameWithBookmakerSpread {
    id: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmaker: Bookmaker;
    week: number;
    sport: string;
}

export enum GameWeekTypes {
    SPREAD = 'spread',
    OVER_UNDER = 'over_under',
}

export function convertGameWithBookmakerSpreadToMatchupClientType(game: GameWithBookmakerSpread, gameWeekId:string): Partial<MatchupClientType> {
    
    const spreadMarket = game.bookmaker.markets.find(m => m.key === "spreads");
    //console.log(spreadMarket?.last_update);
    if (!spreadMarket) {
        throw new Error("Spread market not found");
    }

    const matchup: Partial<MatchupClientType> = {
        api_source: "oddsApi",
        api_game_id: game.id,
        sport: game.sport as string,
        home_team: game.home_team,
        away_team: game.away_team,
        game_date: game.commence_time,
        game_week_id: gameWeekId,
        bookmaker: game.bookmaker.title,
        spread: game.bookmaker.markets.find(m => m.key === "spreads")?.outcomes[0].point || 0,
        spread_date: game.bookmaker.last_update,
        spread_favorite_team: game.bookmaker.markets.find(m => m.key === "spreads")?.outcomes[0].name || '',
        // can_be_picked: 'yes',
    };
    return matchup;
};

export interface SimplifiedGame {
    id: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmaker: string;
    spread_favorite: string;
    spread_points: number;
}

export function convertGameToSimplified(game: GameWithBookmakerSpread): SimplifiedGame {
    const spreadMarket = game.bookmaker.markets.find(m => m.key === "spreads");

    if (!spreadMarket) {
        throw new Error("Spread market not found");
    }

    const favoriteOutcome = spreadMarket.outcomes.find(o => o.point === spreadMarket.outcomes[0].point);
    const underdogOutcome = spreadMarket.outcomes.find(o => o.point === spreadMarket.outcomes[1].point);

    if (!favoriteOutcome || !underdogOutcome) {
        throw new Error("Favorite or underdog outcome not found");
    }

    const simplified: SimplifiedGame = {
        id: game.id,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        bookmaker: game.bookmaker.title,
        spread_favorite: favoriteOutcome.name,
        spread_points: favoriteOutcome.point!
    };
    return simplified;
}