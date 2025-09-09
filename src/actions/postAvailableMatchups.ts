'use server'

import connectToDb from '@/lib/db';
import { MatchupModel, MatchupClientType, MatchupDoc } from '@/models/Matchup'
//import { createClientSafePostHandler } from '@/utils/actionHelpers';

//export const postMatchup = createClientSafePostHandler<MatchupClientType>(MatchupModel as any);

export const postMatchup = async (matchup: Partial<MatchupDoc | MatchupClientType> & { _id?: string }) => {
  await connectToDb();

  // check if event_id is a valid ObjectId, if its a string then convert it
//   if (typeof (matchup.event_id) === 'string') {
//     race.event_id = new Types.ObjectId(race.event_id as string);
//   }

  const matchupData = {
    source_api: matchup.source_api!,
    sport: matchup.sport!,
    home_team: matchup.home_team!,
    away_team: matchup.away_team!,
    game_id: matchup.game_id!,
    game_date: matchup.game_date!,
    week: matchup.week!,
    season: matchup.season!,
    bookmaker: matchup.bookmaker!,
    spread: matchup.spread!,
    spread_favorite_team: matchup.spread_favorite_team!,
    can_be_picked: matchup.can_be_picked || 'yes',
  };

  try {

    if (matchup._id) {
      await MatchupModel.findByIdAndUpdate(matchup._id, matchupData, { new: true });
      return { message: 'Matchup updated successfully' };
    } else {
      const newMatchup = new MatchupModel(matchupData);
      await newMatchup.save();
      return { message: 'Matchup created successfully' };
    }
  } catch (error) {
    console.error('Matchup save error:', error);
    throw new Error('Failed to save matchup');
  }
}

export const postMatchups = async (matchups: (Partial<MatchupDoc | MatchupClientType> & { _id?: string })[]) => {
    // i want to post more than one matchup
    const promises = matchups.map(matchup => postMatchup(matchup));
    await Promise.all(promises);
}
