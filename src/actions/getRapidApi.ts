'use server';

// const url = 'https://therundown-therundown-v1.p.rapidapi.com';

enum RapidApiSportIds {
  NCAA_FOOTBALL = 1,
  NFL = 2,
  NFL_PLAYOFFS = 26
}

interface SportsEvent {
  event_id: string;
  event_date: string;
  teams_normalized: Array<{
    team_id: number;
    name: string;
    mascot: string;
    abbreviation: string;
    is_away: boolean;
    is_home: boolean;
  }>;
  schedule: {
    league_name: string;
    season_type: string;
    season_year: number;
    week: number;
    week_name: string;
  };
  lines: {
    [providerId: string]: {
      line_id: number;
      spread: {
        point_spread_away: number;
        point_spread_home: number;
        point_spread_away_money: number;
        point_spread_home_money: number;
      };
      affiliate: {
        affiliate_id: number;
        affiliate_name: string;
        affiliate_url: string;
      };
    };
  };
}

interface ParsedGame {
  id: string;
  awayTeam: string;
  homeTeam: string;
  date: string;
  spread?: {
    provider: string;
    awaySpread: number;
    homeSpread: number;
    awayMoney: number;
    homeMoney: number;
  } | null;
}

function sportsIdToString(sportId: RapidApiSportIds): string {
  switch (sportId) {
    case RapidApiSportIds.NCAA_FOOTBALL:
      return 'NCAA Football';
    case RapidApiSportIds.NFL:
      return 'NFL';
    case RapidApiSportIds.NFL_PLAYOFFS:
      return 'NFL Playoffs';
    default:
      return 'Unknown Sport';
  }
}

export async function getGamesWithSpreadsByDateAndSportid(date: string, sportId: RapidApiSportIds): Promise<ParsedGame[] | null> {
    // example date format: '2025-09-02'
    // ensure date string follows YYYY-MM-DD format

    const affiliateIdFanduel = affiliates.find(a => a.affiliate_name === 'Fanduel')?.affiliate_id || 23;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }
    console.log(`Fetching games for ${sportsIdToString(sportId)} on ${date}`);
  try {
    const url = `https://therundown-therundown-v1.p.rapidapi.com/sports/${sportId}/events/${date}?include=scores&affiliate_ids=${affiliateIdFanduel}&offset=0`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '3014d56482msh87f52d1445f3387p1fe70ejsn8d42f1a0198a', // Use env variable in production
        'User-Agent': 'Mozilla/5.0 (compatible; NCAA-App/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }

    const data = await response.json() as { events: SportsEvent[] };
    const games: ParsedGame[] = data.events
      .filter(event => event.teams_normalized.length >= 2 && (true || event.schedule.week === 1))
      .map(event => {
        const awayTeam = event.teams_normalized.find(t => t.is_away);
        const homeTeam = event.teams_normalized.find(t => t.is_home);
        const spreadData = event.lines?.['3']?.spread;
        console.log('Event:', event.event_id, 'Teams:', awayTeam?.abbreviation, 'vs', homeTeam?.abbreviation, 'Spread Data:', spreadData);

        return {
          id: event.event_id,
          awayTeam: awayTeam?.abbreviation || 'Unknown',
          homeTeam: homeTeam?.abbreviation || 'Unknown',
          date: event.event_date,
          spread: spreadData && spreadData.point_spread_away !== 0.0001 // Filter out placeholder spreads
            ? {
                provider: event.lines['3'].affiliate.affiliate_name,
                awaySpread: spreadData.point_spread_away,
                homeSpread: spreadData.point_spread_home,
                awayMoney: spreadData.point_spread_away_money,
                homeMoney: spreadData.point_spread_home_money,
              }
            : null,
        };
      });

    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    return null;
  }
}


interface Affiliate {
  affiliate_id: number;
  affiliate_name: string;
  affiliate_url: string;
}

const affiliates: Affiliate[] = [
  {
    affiliate_id: 3,
    affiliate_name: "Pinnacle",
    affiliate_url: "https://www.pinnacle.com/en/rtn"
  },
  {
    affiliate_id: 23,
    affiliate_name: "Fanduel",
    affiliate_url: "https://sportsbook.fanduel.com/"
  },
  {
    affiliate_id: 22,
    affiliate_name: "BetMGM",
    affiliate_url: "https://mediaserver.betmgmpartners.com/renderBanner.do?zoneId=1721362"
  },
  {
    affiliate_id: 2,
    affiliate_name: "Bovada",
    affiliate_url: "https://www.bovada.lv/sports"
  },
  {
    affiliate_id: 12,
    affiliate_name: "Bodog",
    affiliate_url: "https://bit.ly/2Z5uFkw"
  },
  {
    affiliate_id: 19,
    affiliate_name: "Draftkings",
    affiliate_url: "https://sportsbook.draftkings.com/"
  },
  {
    affiliate_id: 21,
    affiliate_name: "Unibet",
    affiliate_url: "https://www.unibet.com/"
  },
  {
    affiliate_id: 16,
    affiliate_name: "Matchbook",
    affiliate_url: "https://www.matchbook.com/"
  },
  {
    affiliate_id: 6,
    affiliate_name: "BetOnline",
    affiliate_url: "https://record.betonlineaffiliates.ag/_4w2QQYoxTW4TMKfio_tvj2Nd7ZgqdRLk/1/"
  },
  {
    affiliate_id: 11,
    affiliate_name: "Lowvig",
    affiliate_url: "https://sportsbook.lowvig.ag/"
  },
  {
    affiliate_id: 4,
    affiliate_name: "Sportsbetting",
    affiliate_url: "https://www.sportsbetting.ag/join?btag=8KfE-TdI6XUcWcOFhDNnKGNd7ZgqdRLk&affid=102915"
  },
  {
    affiliate_id: 14,
    affiliate_name: "Intertops",
    affiliate_url: "http://bit.ly/2XkXdpa"
  },
  {
    affiliate_id: 18,
    affiliate_name: "YouWager",
    affiliate_url: "http://bit.ly/2Z1s37j"
  }
]
