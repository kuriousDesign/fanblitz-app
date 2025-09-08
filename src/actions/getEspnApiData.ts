/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/getNFLGames.ts
"use server";

interface Game {
  id: string;
  name: string;
  date: string;
  competitions: Competition[];
}

interface Competition {
  id: string;
  competitors: Competitor[];
  odds?: Odds[]; // Spreads information may be nested here
}

interface Competitor {
  id: string;
  team: Team;
  score?: string; // May not be available for upcoming games
}

interface Team {
  id: string;
  displayName: string;
  abbreviation: string;
}

interface Odds {
  provider: Provider;
  details: string; // The spread (e.g., "-7.5")
  overUnder: number; // Over/Under total
}

interface Provider {
  id: string;
  name: string;
}

export async function getNFLGamesForWeek(
  week: number,
  year: number = new Date().getFullYear(),
  seasonType: 2 = 2 // 2 for regular season
): Promise<Game[] | null> {
  // You might need to adjust the API endpoint based on the most up-to-date community findings.
  const url = `http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${year}&seasontype=${seasonType}&week=${week}`;
  console.log('Fetching NFL games from URL:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Error fetching NFL games: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // The structure of the data can be complex and may require careful parsing.
    // This is an example of how the data *might* be structured and will likely need adjustments.
    const games: Game[] =
      data.events?.map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.date,
        competitions: event.competitions?.map((comp: any) => ({
          id: comp.id,
          competitors: comp.competitors?.map((c: any) => ({
            id: c.id,
            team: {
              id: c.team.id,
              displayName: c.team.displayName,
              abbreviation: c.team.abbreviation,
            },
            score: c.score?.displayValue,
          })),
          odds: comp.odds?.map((o: any) => ({
            provider: {
              id: o.provider.id,
              name: o.provider.name,
            },
            details: o.details,
            overUnder: o.overUnder,
          })),
        })),
      })) || [];

    return games;
  } catch (error) {
    console.error("Failed to fetch NFL games:", error);
    return null;
  }
}
