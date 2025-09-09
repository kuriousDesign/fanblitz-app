"use server";

import connectToDb from '@/lib/db';
import { createClientSafeGetAllHandler, createClientSafeGetHandler } from '@/utils/actionHelpers';
import { toClientObject } from '@/utils/mongooseHelpers';
import { MatchupClientType, MatchupDoc, MatchupModel } from '@/models/Matchup';


export const getConnectToDb = async () => {await connectToDb();}
export const getMatchup = createClientSafeGetHandler<MatchupDoc,MatchupClientType>(MatchupModel);
export const getMatchups = createClientSafeGetAllHandler<MatchupDoc, MatchupClientType>(MatchupModel);


export const getMatchupsByWeek = async (week: number): Promise<MatchupClientType[]> => {
  await connectToDb();
  const docs = await MatchupModel.find({ week });
  return docs.map((doc) => toClientObject<MatchupClientType>(doc));
};