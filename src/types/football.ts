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
    // Example response from OddsApi for a game score
    // {
    //     "id": "572d984e132eddaac3da93e5db332e7e",
    //     "sport_key": "basketball_nba",
    //     "sport_title": "NBA",
    //     "commence_time": "2022-02-06T03:10:38Z",
    //     "completed": true,
    //     "home_team": "Sacramento Kings",
    //     "away_team": "Oklahoma City Thunder",
    //     "scores": [
    //         {
    //             "name": "Sacramento Kings",
    //             "score": "113"
    //         },
    //         {
    //             "name": "Oklahoma City Thunder",
    //             "score": "103"
    //         }
    //     ],
    //     "last_update": "2022-02-06T05:18:19Z"
    // },
export interface OddsApiGameScore {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    completed: boolean;
    home_team: string;
    away_team: string;
    scores: {
        name: string;
        score: string; // score is a string in the API response
    }[];
    last_update: string;
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

    let favoriteTeam = '';
    const home_team_spread = spreadMarket.outcomes.find(o => o.name === game.home_team);
    const away_team_spread = spreadMarket.outcomes.find(o => o.name === game.away_team);
  
    if((home_team_spread?.point ?? 0) < 0) {
        favoriteTeam = 'home_team';
    } else if ((away_team_spread?.point ?? 0) < 0) {
        favoriteTeam = 'away_team';
    } else {
        favoriteTeam = 'unknown';
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
        spread: Math.abs(game.bookmaker.markets.find(m => m.key === "spreads")?.outcomes[0].point || 0),
        spread_date: game.bookmaker.last_update,
        spread_favorite_team: favoriteTeam,
        home_team_score: 0,
        away_team_score: 0,
        status: 'scheduled',
        winner: '',
        //season: currentYear,
        //week: game.week,
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