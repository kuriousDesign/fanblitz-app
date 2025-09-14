'use server'

import connectToDb from '@/lib/db';
import { MatchupModel, MatchupClientType, MatchupDoc } from '@/models/Matchup'
import { Types } from 'mongoose';



export const postMatchup = async (matchup: Partial<MatchupDoc | MatchupClientType> & { _id?: string }) => {
  await connectToDb();

  if (typeof matchup.game_week_id === 'string') {
    matchup.game_week_id = new Types.ObjectId(matchup.game_week_id as string);
  }

  const matchupData: MatchupDoc = {
    api_source: matchup.api_source!,
    api_game_id: matchup.api_game_id!,
    sport: matchup.sport!,
    game_week_id: matchup.game_week_id!,
    home_team: matchup.home_team!,
    away_team: matchup.away_team!,

    game_date: matchup.game_date!,
    bookmaker: matchup.bookmaker!,
    spread: matchup.spread!,
    spread_date: matchup.spread_date!,
    spread_favorite_team: matchup.spread_favorite_team!,
    can_be_picked: matchup.can_be_picked || 'yes',
  };

  try {

    // if the entry already includes the game_id, update it
    const existingDoc = await MatchupModel.findOne({ api_game_id: matchup.api_game_id });
    if (matchup.api_game_id && existingDoc) {
      await MatchupModel.findByIdAndUpdate(existingDoc._id, matchupData, { new: true });
      return { message: 'Matchup updated successfully' };
    } else if (matchup._id) {
      await MatchupModel.findByIdAndUpdate(matchup._id, matchupData, { new: true });
      return { message: 'Matchup updated successfully' };
    } else {
      const newMatchup = new MatchupModel(matchupData);
      //console.log('New matchup to be saved, spread_date:', newMatchup.spread_date);
      //console.log('New matchup to be saved, game_date:', newMatchup.game_date);
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
  console.log(`Posting ${matchups.length} matchups`);
  const promises = matchups.map(matchup => postMatchup(matchup));
  await Promise.all(promises);
}


