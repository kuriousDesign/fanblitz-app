'use server'; // Marks this as a server action

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

export async function getNFLWeek1GamesWithOdds(): Promise<Array<GameWithOdds> | null> {
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

    return gamesWithOdds;
  } catch (error) {
    console.error('Error fetching NFL Week 1 data:', error);
    return null;
  }
}