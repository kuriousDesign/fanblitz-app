'use server'

import { getWeeksForSeason, WeekData } from '@/data';
import connectToDb from '@/lib/db';
import { GameWeekModel, GameWeekClientType, GameWeekDoc } from '@/models/GameWeek'
import { GameWeekTypes } from '@/types/football';
import { createClientSafePostHandler } from '@/utils/actionHelpers';


export const postGameWeek = createClientSafePostHandler<GameWeekClientType>(GameWeekModel);


export const postGameWeekComplex = async (gameWeek: Partial<GameWeekDoc | GameWeekClientType> & { _id?: string }) => {
  await connectToDb();
  //console.log('Posting game week:', gameWeek);
  
  const data = {
    season: gameWeek.season!,
    week: gameWeek.week!,
    start_date: gameWeek.start_date!, 
    end_date: gameWeek.end_date!,
    name: gameWeek.name!,
    status: gameWeek.status!,
    type: gameWeek.type!,
    num_selections: gameWeek.num_selections!,
    max_allowed_free_selections: gameWeek.max_allowed_free_selections!,
    is_private: gameWeek.is_private!,
    password: gameWeek.password!,
    purse_amount: gameWeek.purse_amount!,
    num_players: gameWeek.num_players || 0,
  };

  try {
    const existingDoc = await GameWeekModel.findOne({ season: gameWeek.season, week: gameWeek.week });
    if (existingDoc) {
      await GameWeekModel.findByIdAndUpdate(existingDoc._id, data, { new: true });
      return { message: 'Game week updated successfully' };
    } else if (gameWeek._id) {
      await GameWeekModel.findByIdAndUpdate(gameWeek._id, data, { new: true });
      return { message: 'Game week updated successfully' };
    } else {
      const newGameWeek = new GameWeekModel(data);
      await newGameWeek.save();
      return { message: 'Game week created successfully' };
    } 
  } catch (error) {
    console.error('Game week save error:', error);
    throw new Error('Failed to save game week');
  } 
}

export const createAndPostGameWeeksForSeason = async (season:number) => {
    // create array of start and end date for 
    const weeks = getWeeksForSeason(season);
    if (!weeks || weeks.length === 0) {
        throw new Error(`No weeks found for season ${season}`);
    }
    // need to make a GameWeek for each week in the season
    const promises: Promise<unknown>[] = [];
    weeks.map((week: WeekData) => {
        const gameWeek: GameWeekClientType = {
            season,
            week: week.weekNumber,
            start_date: week.startDate,
            end_date: week.endDate,
            name: `Week ${week.weekNumber}`,
            status: 'created',
            type: GameWeekTypes.SPREAD,
            num_selections: 30,
            max_allowed_free_selections: 5,
            is_private: false,
            password: '',
            purse_amount: 100000,
            num_players: 0
        };

        promises.push(postGameWeek(gameWeek));
    });

    await Promise.all(promises);
}
