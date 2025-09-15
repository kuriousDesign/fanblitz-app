/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import axios from "axios";
import { GameWithBookmakerSpread, OddsApiGameScore, Sports, convertGameWithBookmakerSpreadToMatchupClientType } from "@/types/football";
import { getGameWeek, getMatchupsByGameWeek } from "./getMatchups";
import { postMatchup, postMatchups } from "./postMatchup";
import { MatchupClientType } from "@/models/Matchup";

const API_KEY = process.env.ODDS_API_KEY; // Store your API key in .env.local

//const KURIOUS_API_KEY_FOR_ODDS = "55502306146b29bfa749daae8bb44e66";


// 🔥 New function: NCAA odds prioritized for FanDuel
export async function getOddsApiNcaaMatchupsWithSpreadByWeek(week: number): Promise<GameWithBookmakerSpread[]> {

  //const nflUrl = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=YOUR_API_KEY&regions=us&markets=spreads&oddsFormat=american";
  const sport = Sports.NCAA_FOOTBALL;
  //const nflSport = "americanfootball_nfl"; // NFL sport key

  //commenceTimeFrom   Optional - filter the response to show games that commence on and after this parameter. Values are in ISO 8601 format, for example 2023-09-09T00:00:00Z. This parameter has no effect if the sport is set to 'upcoming'.
  //week 1 start was august 23 at 1200 am
  const season = 2025; // Use current season
  const week1StartDay = 26; // Aug 24 is first game saturday
  const week1StartMonth = 8; // August (use 08 to ensure proper formatting)
  const week1EndDay = 2; // Sep 2 is monday after week 1
  const week1EndMonth = 9; // September (use 09 to ensure proper formatting)

  // Format dates to match API expected format: 2023-09-10T23:59:59Z
  const week1StartFormatted = `${season}-${week1StartMonth.toString().padStart(2, '0')}-${week1StartDay.toString().padStart(2, '0')}`;
  const week1EndFormatted = `${season}-${week1EndMonth.toString().padStart(2, '0')}-${week1EndDay.toString().padStart(2, '0')}`;

  const week1CommenceStart = `${week1StartFormatted}T00:00:00Z`;
  const week1CommenceEnd = `${week1EndFormatted}T23:59:59Z`;
  //results: 2024-09-07T00:00:00.000Z

  const diffWeeks = week - 1;
  let commenceTimeFrom = new Date(new Date(week1CommenceStart).getTime() + diffWeeks * 7 * 24 * 60 * 60 * 1000).toISOString();
  // replace 0Z with Z at the end
  commenceTimeFrom = commenceTimeFrom.replace(/.000Z$/, 'Z');
  let commenceTimeTo = new Date(new Date(week1CommenceEnd).getTime() + diffWeeks * 7 * 24 * 60 * 60 * 1000).toISOString();
  commenceTimeTo = commenceTimeTo.replace(/.000Z$/, 'Z');

  const queriedBookmakers = [
    "fanduel",
    "draftkings",
    "betmgm",
    "caesars"
  ];

  console.log(`Fetching NCAA week ${week} spreads from ${commenceTimeFrom} to ${commenceTimeTo}`);
  try {
    const oddsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: "us",
          bookmakers: queriedBookmakers.join(","),
          markets: "spreads",
          oddsFormat: "american",
          dateFormat: "iso",
          commenceTimeFrom,
          commenceTimeTo
        }
      }
    );

    const filtered: GameWithBookmakerSpread[] = oddsRes.data.map((game: any) => {
      let bookmaker = null;
      for (const bKey of queriedBookmakers) {
        bookmaker = game.bookmakers.find((b: { key: string; }) => b.key === bKey);
        if (bookmaker) break;
      }

      if (!bookmaker) {
        console.warn(`No queried bookmaker found for game ${game.id} between ${game.home_team} and ${game.away_team} at ${game.commence_time}`);
        return null; // skip this game if no bookmaker found
      }

      const gameWithBookmakerSpread: GameWithBookmakerSpread = {
        id: game.id,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        bookmaker,
        sport: Sports.NCAA_FOOTBALL,
        week,
      };
      return gameWithBookmakerSpread;
    });

    const nonNullFiltered = filtered.filter((game): game is GameWithBookmakerSpread => game !== null);
    if (nonNullFiltered.length === 0) {
      console.warn(`No NCAA games with spreads found for week ${week} from ${commenceTimeFrom} to ${commenceTimeTo}`);
    }

    return nonNullFiltered;
  } catch (error: unknown) {
    console.error("Error fetching ncaa fanduel odds from OddsApi:", error);
    return [];
  }
}

export async function updateSpreadDataNcaaFootballGameWeekMatchups(gameWeekId: string): Promise<Partial<MatchupClientType>[]> {
  const gameWeek = await getGameWeek(gameWeekId);
  if (!gameWeek || !gameWeek.week) {
    throw new Error(`Game week not found for id ${gameWeekId}`);
  }
  const games = await getOddsApiNcaaMatchupsWithSpreadByWeek(gameWeek.week);
  if (games.length === 0) {
    console.error(`No NCAA games with spreads found for week ${gameWeek.week}`);
    return [];
  }
  const matchups = games.map(game => convertGameWithBookmakerSpreadToMatchupClientType(game, gameWeekId));
  //console.log(`Posting ${matchups.length} NCAA games with spreads for week ${week}`);
  await postMatchups(matchups);
  const fetchedMatchups = await getMatchupsByGameWeek(gameWeekId);
  //console.log(`Fetched ${fetchedMatchups.length} NCAA games with spreads for week ${week}`);
  //console.log('First converted matchup:');
  //console.log(matchups[0]);
  return fetchedMatchups;
}





// 🔥 New function: NCAA odds prioritized for FanDuel
export async function updateOddsApiNcaaMatchupsScoresByGameWeek(gameWeekId: string): Promise<boolean> {

  //const nflUrl = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=YOUR_API_KEY&regions=us&markets=spreads&oddsFormat=american";
  const sport = Sports.NCAA_FOOTBALL;
  //const nflSport = "americanfootball_nfl"; // NFL sport key
  const gameWeek = await getGameWeek(gameWeekId);
  if (!gameWeek || !gameWeek.week) {
    throw new Error(`Game week not found for id ${gameWeekId}`);
  }

  const matchups = await getMatchupsByGameWeek(gameWeekId);
  if (!matchups || matchups.length === 0) {
    console.warn(`No matchups found for game week ${gameWeekId}`);
    return false;
  }

  const apiGameIdsFromMatchups = matchups.map(matchup => matchup.api_game_id);

  console.log(`Fetching NCAA week ${gameWeek.week} scores for ${apiGameIdsFromMatchups.length} matchups`);

  // GET /v4/sports/{sport}/scores/?apiKey={apiKey}&daysFrom={daysFrom}&dateFormat={dateFormat}

  // #Parameters
  // sport   The sport key obtained from calling the /sports endpoint.
  // apiKey   The API key associated with your subscription. See usage plans
  // daysFrom   Optional - The number of days in the past from which to return completed games. Valid values are integers from 1 to 3. If this parameter is missing, only live and upcoming games are returned.
  // dateFormat   Optional - Determines the format of timestamps in the response. Valid values are unix and iso (ISO 8601). Defaults to iso.
  // eventIds   Optional - Comma-separated game ids. Filters the response to only return games for the specified game ids.
  // #Schema
  try {
    const oddsRes = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport}/scores`,
      {
        params: {
          apiKey: API_KEY,
          eventIds: apiGameIdsFromMatchups.join(","),
        }
      }
    );

    console.log(`Fetched ${oddsRes.data.length} NCAA games with scores for week ${gameWeek.week}, expected ${apiGameIdsFromMatchups.length}`);
    const updatePromises: Promise<unknown>[] = [];
    oddsRes.data.map((matchupScore: OddsApiGameScore) => {
      console.log(matchupScore);
      // find corresponding matchup with same id
      const correspondingMatchup = matchups.find(m => m.api_game_id === matchupScore.id);
      // create list of promises
      
      if (correspondingMatchup) {
        // update scores in the corresponding matchup
        // extract home score from matchupScore
        if (!matchupScore.scores || matchupScore.scores.length === 0) {
          console.warn(`No scores found for game ${matchupScore.id} between ${matchupScore.home_team} and ${matchupScore.away_team}`);
          correspondingMatchup.home_team_score = -1;
          correspondingMatchup.away_team_score = -1;
          correspondingMatchup.winner = 'waiting for game to start';
          correspondingMatchup.status = 'scheduled';

        } else {
          const homeScoreObj = matchupScore.scores.find(s => s.name === matchupScore.home_team);
          const homeScore = homeScoreObj ? parseInt(homeScoreObj.score) : 0;
          const awayScoreObj = matchupScore.scores.find(s => s.name === matchupScore.away_team);
          const awayScore = awayScoreObj ? parseInt(awayScoreObj.score) : 0;

          correspondingMatchup.home_team_score = homeScore;
          correspondingMatchup.away_team_score = awayScore;
          correspondingMatchup.status = matchupScore.completed ? 'finished' : 'in_progress';
          if (matchupScore.completed) {
            if (homeScore - Math.abs(correspondingMatchup.spread) > awayScore) {
              correspondingMatchup.winner = 'home_team';
            } else if (awayScore - Math.abs(correspondingMatchup.spread) > homeScore) {
              correspondingMatchup.winner = 'away_team';
            } else {
              correspondingMatchup.winner = 'push';
            }
          }
        }
        // create promise to to update the matchup
        updatePromises.push(postMatchup(correspondingMatchup));
      }
    });
    if (updatePromises.length === 0) {
      console.warn(`No matchups to update for game week ${gameWeek.week}`);
      return false;
    }
    await Promise.all(updatePromises);
    return true;
  } catch (error: unknown) {
    console.error("Error updating matchups with scores:", error);
    return false;
  }
}
