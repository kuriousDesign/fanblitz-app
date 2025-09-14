'use server';
import { SimplifiedGame } from "@/types/football";

 // Marks this as a server action

interface NFLEvent {
  id: string;
  name: string;
  date: string;
  competitions: Array<{
    competitors: Array<{
      team: { displayName: string; abbreviation: string };
    }>;
  }>;
}

interface Odds {
  id: string;
  name: string;
  items: Array<{
    name: string;
    oddsType: string;
    details: string; // e.g., "BAL -1.5"
    odds: Array<{
      name: string;
      value: number;
    }>;
  }>;
}

export interface GameWithOdds {
  id: string;
  awayTeam: string;
    homeTeam: string;
    date: string;
    odds: Odds | null;
}


export async function getNFLWeek1GamesWithOdds(): Promise<Array<SimplifiedGame> | null> {
  try {
    // Step 1: Fetch Week 1 schedule
    const scheduleUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=1&dates=2025';
    const scheduleResponse = await fetch(scheduleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NFL-App/1.0)' }, // Mimic browser to avoid blocks
    });

    if (!scheduleResponse.ok) {
      throw new Error(`Failed to fetch schedule: ${scheduleResponse.status}`);
    }

    const scheduleData = await scheduleResponse.json() as { events: NFLEvent[] };
    const games = scheduleData.events
      .filter(event => event.competitions.length > 0) // Ensure valid games
      .map(event => {
        const comp = event.competitions[0];
        const awayTeam = comp.competitors[0].team.abbreviation;
        const homeTeam = comp.competitors[1].team.abbreviation;
        return {
          id: event.id,
          awayTeam,
          homeTeam,
          date: event.date,
          odds: null as Odds | null, // Placeholder
        };
      });

    // Step 2: Enrich each game with odds (parallel fetches for efficiency)
    const gamesWithOdds = await Promise.all(
      games.map(async (game) => {
        try {
          const oddsUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${game.id}/competitions/${game.id}/odds`;
          const oddsResponse = await fetch(oddsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NFL-App/1.0)' },
          });

          if (oddsResponse.ok) {
            const oddsData = await oddsResponse.json() as Odds;
            return { ...game, odds: oddsData };
          }
        } catch (error) {
          console.error(`Failed to fetch odds for game ${game.id}:`, error);
        }
        return game; // Return without odds if fetch fails
      })
    );

    return gamesWithOdds.map(game => (convertGameWithOddsToSimplifiedGame(game)));
  } catch (error) {
    console.error('Error fetching NFL Week 1 data:', error);
    return null;
  }
}



export async function getNCAAWeek1GamesWithOdds(): Promise<Array<SimplifiedGame> | null> {
  try {
    // Step 1: Fetch Week 3 schedule
    const scheduleUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?seasontype=2&week=3&dates=2025';
    const scheduleResponse = await fetch(scheduleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NCAA-App/1.0)' }, // Mimic browser to avoid blocks
    });
    
    if (!scheduleResponse.ok) {
      throw new Error(`Failed to fetch schedule: ${scheduleResponse.status}`);
    }
    
    const scheduleData = await scheduleResponse.json() as { events: NFLEvent[] };
    const games = scheduleData.events
      .filter(event => event.competitions.length > 0) // Ensure valid games
      .map(event => {
        const comp = event.competitions[0];
        const awayTeam = comp.competitors[0].team.abbreviation;
        const homeTeam = comp.competitors[1].team.abbreviation;
        return {
          id: event.id,
          awayTeam,
          homeTeam,
          date: event.date,
          odds: null as Odds | null, // Placeholder
        };
      });

    // Step 2: Enrich each game with odds (parallel fetches for efficiency)
    const gamesWithOdds = await Promise.all(
      games.map(async (game) => {
        try {
          const oddsUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/events/${game.id}/competitions/${game.id}/odds`;
          console.log(oddsUrl);
          const oddsResponse = await fetch(oddsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NCAA-App/1.0)' },
          });
          
          if (oddsResponse.ok) {
            const oddsData = await oddsResponse.json() as Odds;
            return { ...game, odds: oddsData };
          }
        } catch (error) {
          console.error(`Failed to fetch odds for game ${game.id}:`, error);
        }
        return game; // Return without odds if fetch fails
      })
    );

    console.log(gamesWithOdds[0]);
    return gamesWithOdds.map(game => (convertGameWithOddsToSimplifiedGame(game)));
  } catch (error) {
    console.error('Error fetching NCAA Week 1 data:', error);
    return null;
  }
}

// export const exampleNflGameWithOdds: unknown = {
    
//     "id": "401772918",
//     "awayTeam": "BUF",
//     "homeTeam": "BAL",
//     "date": "2025-09-08T00:20Z",
//     "odds": {
//         "count": 2,
//         "pageIndex": 1,
//         "pageSize": 25,
//         "pageCount": 1,
//         "items": [
//             {
//                 "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401772918/competitions/401772918/odds/58?lang=en&region=us",
//                 "provider": {
//                     "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/providers/58?lang=en&region=us",
//                     "id": "58",
//                     "name": "ESPN BET",
//                     "priority": 1
//                 },
//                 "details": "BAL -1.5",
//                 "overUnder": 51.5,
//                 "spread": 1.5,
//                 "overOdds": -105,
//                 "underOdds": -115,
//                 "awayTeamOdds": {
//                     "favorite": true,
//                     "underdog": false,
//                     "moneyLine": -120,
//                     "spreadOdds": -105,
//                     "open": {
//                         "favorite": false,
//                         "pointSpread": {
//                             "alternateDisplayValue": "+1.5",
//                             "american": "+1.5"
//                         },
//                         "spread": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120"
//                         },
//                         "moneyLine": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         }
//                     },
//                     "close": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "-1.5",
//                             "american": "-1.5"
//                         },
//                         "spread": {
//                             "value": 1.952,
//                             "displayValue": "20/21",
//                             "alternateDisplayValue": "-105",
//                             "decimal": 1.952,
//                             "fraction": "20/21",
//                             "american": "-105"
//                         },
//                         "moneyLine": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120"
//                         }
//                     },
//                     "current": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "-1.5",
//                             "american": "-1.5"
//                         },
//                         "spread": {
//                             "value": 1.952,
//                             "displayValue": "20/21",
//                             "alternateDisplayValue": "-105",
//                             "decimal": 1.952,
//                             "fraction": "20/21",
//                             "american": "-105",
//                             "outcome": {
//                                 "type": "pending"
//                             }
//                         },
//                         "moneyLine": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120",
//                             "outcome": {
//                                 "type": "pending"
//                             }
//                         }
//                     },
//                     "team": {
//                         "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/teams/33?lang=en&region=us"
//                     }
//                 },
//                 "homeTeamOdds": {
//                     "favorite": false,
//                     "underdog": true,
//                     "moneyLine": 100,
//                     "spreadOdds": -115,
//                     "open": {
//                         "favorite": true,
//                         "pointSpread": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "-1.5",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "-1.5"
//                         },
//                         "spread": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         },
//                         "moneyLine": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120"
//                         }
//                     },
//                     "close": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "+1.5",
//                             "american": "+1.5"
//                         },
//                         "spread": {
//                             "value": 1.87,
//                             "displayValue": "20/23",
//                             "alternateDisplayValue": "-115",
//                             "decimal": 1.87,
//                             "fraction": "20/23",
//                             "american": "-115"
//                         },
//                         "moneyLine": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         }
//                     },
//                     "current": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "+1.5",
//                             "american": "+1.5"
//                         },
//                         "spread": {
//                             "value": 1.87,
//                             "displayValue": "20/23",
//                             "alternateDisplayValue": "-115",
//                             "decimal": 1.87,
//                             "fraction": "20/23",
//                             "american": "-115",
//                             "outcome": {
//                                 "type": "pending"
//                             }
//                         },
//                         "moneyLine": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN",
//                             "outcome": {
//                                 "type": "pending"
//                             }
//                         }
//                     },
//                     "team": {
//                         "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/teams/2?lang=en&region=us"
//                     }
//                 },
//                 "links": [
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "home",
//                             "desktop",
//                             "bets",
//                             "espn-bet"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=fe40e579-88aa-4d73-b749-0e39a5c3d5ec&odds_numerator[0]=2&odds_denominator[0]=1",
//                         "text": "Home Bet",
//                         "shortText": "Home Bet",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "away",
//                             "desktop",
//                             "bets",
//                             "espn-bet"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=7583ee0c-f0e3-4ecd-9ee6-4f4a18e60ddd&odds_numerator[0]=11&odds_denominator[0]=6",
//                         "text": "Away Bet",
//                         "shortText": "Away Bet",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "homeSpread",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=2dfdb0f0-c66e-439a-8e29-c57464952355&odds_numerator[0]=43&odds_denominator[0]=23",
//                         "text": "Home Point Spread",
//                         "shortText": "Home Point Spread",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "awaySpread",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=b63acde4-1451-4bec-8da4-a86396413684&odds_numerator[0]=41&odds_denominator[0]=21",
//                         "text": "Away Point Spread",
//                         "shortText": "Away Point Spread",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "over",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=c374a6ab-3cdc-443b-a4c3-38f6f092476f&odds_numerator[0]=41&odds_denominator[0]=21",
//                         "text": "Over Odds",
//                         "shortText": "Over Odds",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "under",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=8a1fd962-2baf-4fe2-9486-1d4301085a0e&odds_numerator[0]=43&odds_denominator[0]=23",
//                         "text": "Under Odds",
//                         "shortText": "Under Odds",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "game",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389",
//                         "text": "Game",
//                         "shortText": "Game",
//                         "isExternal": true,
//                         "isPremium": false
//                     }
//                 ],
//                 "moneylineWinner": false,
//                 "spreadWinner": false,
//                 "open": {
//                     "over": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115"
//                     },
//                     "under": {
//                         "value": 1.952,
//                         "displayValue": "20/21",
//                         "alternateDisplayValue": "-105",
//                         "decimal": 1.952,
//                         "fraction": "20/21",
//                         "american": "-105"
//                     },
//                     "total": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "51.5",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "51.5"
//                     }
//                 },
//                 "close": {
//                     "over": {
//                         "value": 1.952,
//                         "displayValue": "20/21",
//                         "alternateDisplayValue": "-105",
//                         "decimal": 1.952,
//                         "fraction": "20/21",
//                         "american": "-105"
//                     },
//                     "under": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115"
//                     },
//                     "total": {
//                         "alternateDisplayValue": "51.5",
//                         "american": "51.5"
//                     }
//                 },
//                 "current": {
//                     "over": {
//                         "value": 1.952,
//                         "displayValue": "20/21",
//                         "alternateDisplayValue": "-105",
//                         "decimal": 1.952,
//                         "fraction": "20/21",
//                         "american": "-105",
//                         "outcome": {
//                             "type": "pending"
//                         }
//                     },
//                     "under": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115",
//                         "outcome": {
//                             "type": "pending"
//                         }
//                     },
//                     "total": {
//                         "alternateDisplayValue": "51.5",
//                         "american": "51.5"
//                     }
//                 },
//                 "propBets": {
//                     "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401772918/competitions/401772918/odds/58/propBets?lang=en&region=us"
//                 }
//             },
//             {
//                 "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401772918/competitions/401772918/odds/59?lang=en&region=us",
//                 "provider": {
//                     "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/providers/59?lang=en&region=us",
//                     "id": "59",
//                     "name": "ESPN Bet - Live Odds",
//                     "priority": 0
//                 },
//                 "details": "BAL -7.5",
//                 "overUnder": 57.5,
//                 "spread": 7.5,
//                 "overOdds": -115,
//                 "underOdds": -115,
//                 "awayTeamOdds": {
//                     "favorite": true,
//                     "underdog": false,
//                     "moneyLine": -650,
//                     "spreadOdds": 100,
//                     "open": {
//                         "favorite": false,
//                         "pointSpread": {
//                             "alternateDisplayValue": "+1.5",
//                             "american": "+1.5"
//                         },
//                         "spread": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120"
//                         },
//                         "moneyLine": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         }
//                     },
//                     "current": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "-7.5",
//                             "american": "-7.5"
//                         },
//                         "spread": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         },
//                         "moneyLine": {
//                             "value": 1.154,
//                             "displayValue": "2/13",
//                             "alternateDisplayValue": "-650",
//                             "decimal": 1.154,
//                             "fraction": "2/13",
//                             "american": "-650"
//                         }
//                     },
//                     "team": {
//                         "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/teams/33?lang=en&region=us"
//                     }
//                 },
//                 "homeTeamOdds": {
//                     "favorite": false,
//                     "underdog": true,
//                     "moneyLine": 380,
//                     "spreadOdds": -130,
//                     "open": {
//                         "favorite": true,
//                         "pointSpread": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "-1.5",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "-1.5"
//                         },
//                         "spread": {
//                             "value": 2,
//                             "displayValue": "1/1",
//                             "alternateDisplayValue": "EVEN",
//                             "decimal": 2,
//                             "fraction": "1/1",
//                             "american": "EVEN"
//                         },
//                         "moneyLine": {
//                             "value": 1.833,
//                             "displayValue": "5/6",
//                             "alternateDisplayValue": "-120",
//                             "decimal": 1.833,
//                             "fraction": "5/6",
//                             "american": "-120"
//                         }
//                     },
//                     "current": {
//                         "pointSpread": {
//                             "alternateDisplayValue": "+7.5",
//                             "american": "+7.5"
//                         },
//                         "spread": {
//                             "value": 1.769,
//                             "displayValue": "10/13",
//                             "alternateDisplayValue": "-130",
//                             "decimal": 1.769,
//                             "fraction": "10/13",
//                             "american": "-130"
//                         },
//                         "moneyLine": {
//                             "value": 4.8,
//                             "displayValue": "19/5",
//                             "alternateDisplayValue": "+380",
//                             "decimal": 4.8,
//                             "fraction": "19/5",
//                             "american": "+380"
//                         }
//                     },
//                     "team": {
//                         "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2025/teams/2?lang=en&region=us"
//                     }
//                 },
//                 "links": [
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "home",
//                             "desktop",
//                             "bets",
//                             "espn-bet---live-odds"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=fe40e579-88aa-4d73-b749-0e39a5c3d5ec&odds_numerator[0]=24&odds_denominator[0]=5",
//                         "text": "Home Bet",
//                         "shortText": "Home Bet",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "away",
//                             "desktop",
//                             "bets",
//                             "espn-bet---live-odds"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=7583ee0c-f0e3-4ecd-9ee6-4f4a18e60ddd&odds_numerator[0]=15&odds_denominator[0]=13",
//                         "text": "Away Bet",
//                         "shortText": "Away Bet",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "homeSpread",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=17278a29-56aa-4067-9c64-c85663d3b8cb&odds_numerator[0]=23&odds_denominator[0]=13",
//                         "text": "Home Point Spread",
//                         "shortText": "Home Point Spread",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "awaySpread",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=43c6674d-f09c-44ec-88d0-ce2c3467f511&odds_numerator[0]=2&odds_denominator[0]=1",
//                         "text": "Away Point Spread",
//                         "shortText": "Away Point Spread",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "over",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=6955a6bc-228e-4ef5-a994-79b7709df8ff&odds_numerator[0]=43&odds_denominator[0]=23",
//                         "text": "Over Odds",
//                         "shortText": "Over Odds",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "under",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389&market_selection_id[0]=d667e365-6ebe-4029-8144-1a71f2efffc3&odds_numerator[0]=43&odds_denominator[0]=23",
//                         "text": "Under Odds",
//                         "shortText": "Under Odds",
//                         "isExternal": true,
//                         "isPremium": false
//                     },
//                     {
//                         "language": "en-US",
//                         "rel": [
//                             "game",
//                             "desktop",
//                             "bets"
//                         ],
//                         "href": "https://espnbet.app.link/integrations?%243p=a_espn&clr=espnbettingintegration&$canonical_url=/sport/football/organization/united-states/competition/nfl/event/f132e99f-5418-4ad2-b014-013d5234c389",
//                         "text": "Game",
//                         "shortText": "Game",
//                         "isExternal": true,
//                         "isPremium": false
//                     }
//                 ],
//                 "moneylineWinner": false,
//                 "spreadWinner": false,
//                 "open": {
//                     "over": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115"
//                     },
//                     "under": {
//                         "value": 1.952,
//                         "displayValue": "20/21",
//                         "alternateDisplayValue": "-105",
//                         "decimal": 1.952,
//                         "fraction": "20/21",
//                         "american": "-105"
//                     },
//                     "total": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "51.5",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "51.5"
//                     }
//                 },
//                 "current": {
//                     "over": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115"
//                     },
//                     "under": {
//                         "value": 1.87,
//                         "displayValue": "20/23",
//                         "alternateDisplayValue": "-115",
//                         "decimal": 1.87,
//                         "fraction": "20/23",
//                         "american": "-115"
//                     },
//                     "total": {
//                         "alternateDisplayValue": "57.5",
//                         "american": "57.5"
//                     }
//                 },
//                 "propBets": {
//                     "$ref": "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401772918/competitions/401772918/odds/59/propBets?lang=en&region=us"
//                 }
//             }
//         ]
//     }
// }


//const spreadExample = exampleGameWithOdds.odds?.items[0].details as unknown;
//console.log('!!!!!!!!!Example Spread:', spreadExample);


// interface SimplifiedGame {
//     id: string;
//     commence_time: string;
//     home_team: string;
//     away_team: string;
//     bookmaker: string;
//     spread_favorite: string;
//     spread_points: number;
// }


function convertGameWithOddsToSimplifiedGame(
  game: GameWithOdds
): SimplifiedGame {
    //console.log(game.odds?.items);
    const details = game.odds?.items[0].details ?? null;
    // SEPARATE details into team and points
    if (!details) {
        console.log(game.odds?.items);
        //throw new Error("No details found in game odds");
        const simpleGame: SimplifiedGame = {
            id: game.id,
            commence_time: game.date,
            home_team: game.homeTeam,
            away_team: game.awayTeam,
            bookmaker: "ESPN Bet",
            spread_favorite: "",
            spread_points: 0,
        };
        return simpleGame;
    }
    const [team, points] = details.split(" ");
    const simpleGame: SimplifiedGame = {
        id: game.id,
        commence_time: game.date,
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        bookmaker: "ESPN Bet",
        spread_favorite: team,
        spread_points: Number(points),
    };

    return simpleGame;
}