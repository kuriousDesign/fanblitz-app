/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import axios from "axios";
import {Game, SimplifiedGame, convertGameToSimplified} from "@/types/football";

const API_KEY = process.env.ODDS_API_KEY; // Store your API key in .env.local

// Generic fetch for sports list and odds
export async function getSportsData(sportKey = "upcoming") {
  try {
    // Get list of sports
    const sportsRes = await axios.get("https://api.the-odds-api.com/v4/sports", {
      params: { apiKey: API_KEY }
    });

    // Get odds for a specific sport
    const oddsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: "us",
          markets: "h2h",
          oddsFormat: "decimal",
          dateFormat: "iso"
        }
      }
    );

    return {
      sports: sportsRes.data,
      odds: oddsRes.data,
      requestsRemaining: oddsRes.headers["x-requests-remaining"],
      requestsUsed: oddsRes.headers["x-requests-used"]
    };
  } catch (error: unknown) {
    const isAxiosError = axios.isAxiosError(error);
    return {
      error: isAxiosError
        ? error.response?.data
        : error instanceof Error
        ? error.message
        : "Unknown error",
      status: isAxiosError ? error.response?.status : undefined
    };
  }
}



// 🔥 New function: NFL odds filtered for FanDuel
export async function getNFLOddsFromFanduel() : Promise<SimplifiedGame[]> {
  try {
    const oddsRes = await axios.get(
      "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds",
      {
        params: {
          apiKey: API_KEY,
          regions: "us",
          markets: "h2h,spreads,totals",
          oddsFormat: "american",
          dateFormat: "iso"
        }
      }
    );

    // Only keep FanDuel bookmaker odds
    const filtered = oddsRes.data.map((game: any) => {
      const fanduel = game.bookmakers.find((b: any) => b.key === "fanduel");
      return {
        id: game.id,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        fanduel
      };
    });

    // convert filtered to simplified games
    const simplified = filtered.map((game: any) => {
        return convertGameToSimplified(game as Game);
    });

    return simplified;
  } catch (error: unknown) {
    console.error("Error fetching NFL odds from FanDuel:", error);
    return [];
  }
}


const SPORT_KEY = 'americanfootball_nfl'; // NFL sport key
const REGION = 'us'; // US region for FanDuel
const MARKETS = 'h2h'; // Moneyline market
const ODDS_FORMAT = 'american'; // American odds format
const BOOKMAKERS = 'fanduel'; // Specifically for FanDuel odds

async function getNFLWeekOdds() {
    const url = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds?apiKey=${API_KEY}&regions=${REGION}&markets=${MARKETS}&oddsFormat=${ODDS_FORMAT}&bookmakers=${BOOKMAKERS}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error fetching data: ${data.message}`);
            return [];
        }

        return data; // This will contain the NFL games and FanDuel odds

    } catch (error) {
        console.error("Failed to fetch NFL odds:", error);
        return [];
    }
}

// Example usage:
getNFLWeekOdds().then(games => {
    if (games.length > 0) {
        console.log("Upcoming NFL games with FanDuel H2H odds:");
        games.forEach((game: { home_team: any; away_team: any; commence_time: string | number | Date; bookmakers: any[]; }) => {
            console.log(`\nGame: ${game.home_team} vs ${game.away_team}`);
            console.log(`Start Time: ${new Date(game.commence_time).toLocaleString()}`);
            
            const fanduelOdds = game.bookmakers.find(b => b.key === 'fanduel');
            if (fanduelOdds) {
                fanduelOdds.markets.forEach((market: { outcomes: any[]; }) => {
                    market.outcomes.forEach(outcome => {
                        console.log(`  ${outcome.name}: ${outcome.price}`);
                    });
                });
            } else {
                console.log("  FanDuel odds not found for this game.");
            }
        });
    } else {
        console.log("No upcoming NFL games with FanDuel odds found.");
    }
});