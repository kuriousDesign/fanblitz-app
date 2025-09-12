'use server'

//import connectToDb from '@/lib/db';
//import { MatchupModel, MatchupClientType, MatchupDoc } from '@/models/Matchup'
//import { createClientSafePostHandler } from '@/utils/actionHelpers';
export const postPick = async (pick: string) => {
  console.log("in postPick selection:", pick);
  // do something with the pick, e.g., save to database
  return { message: 'Pick processed successfully' };
}