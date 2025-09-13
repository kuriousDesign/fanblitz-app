"use server";

import connectToDb from '@/lib/db';
import { createClientSafeGetAllHandler, createClientSafeGetHandler } from '@/utils/actionHelpers';

import { MatchupClientType, MatchupDoc, MatchupModel } from '@/models/Matchup';
import { Types } from 'mongoose';
import { GameWeekClientType, GameWeekDoc, GameWeekModel } from '@/models/GameWeek';
import { SpreadPickClientType, SpreadPickDoc, SpreadPickModel } from '@/models/SpreadPick';
import { GameStates } from '@/types/enums';


export const getConnectToDb = async () => {await connectToDb();}
export const getMatchup = createClientSafeGetHandler<MatchupDoc, MatchupClientType>(MatchupModel);
export const getMatchups = createClientSafeGetAllHandler<MatchupDoc, MatchupClientType>(MatchupModel);

export const getGameWeek = createClientSafeGetHandler<GameWeekDoc, GameWeekClientType>(GameWeekModel);
export const getGameWeeks = createClientSafeGetAllHandler<GameWeekDoc, GameWeekClientType>(GameWeekModel);

export const getSpreadPick = createClientSafeGetHandler<SpreadPickDoc, SpreadPickClientType>(SpreadPickModel);
export const getSpreadPicks = createClientSafeGetAllHandler<SpreadPickDoc, SpreadPickClientType>(SpreadPickModel);


export const getActiveGameWeek = async (): Promise<GameWeekClientType | null> => {
  const filter = { status: GameStates.OPEN };
  const gameWeeks = await getGameWeeks(filter);
  if(!gameWeeks || gameWeeks.length === 0 ) {
    return null;
  } else if (gameWeeks.length > 1) {
    throw new Error(`Multiple active game weeks found`);
  }
  return gameWeeks[0];
};

export const getMatchupsByGameWeek = async (gameWeekId: string): Promise<MatchupClientType[]> => {
  const filter = { game_week_id: new Types.ObjectId(gameWeekId) };
  const matchups = await getMatchups(filter);
  return matchups;
};

export const getSpreadPicksByPlayerAndGameWeek = async (playerId: string, gameWeekId: string): Promise<SpreadPickClientType[]> => {
  const filter = { 
    player_id: new Types.ObjectId(playerId),
    game_week_id: new Types.ObjectId(gameWeekId)
  };
  const spreadPicks = await getSpreadPicks(filter);
  return spreadPicks;
};

export const getGameWeekByWeek = async (week: number): Promise<GameWeekClientType> => {
  const filter = { week };
  const gameWeeks = await getGameWeeks(filter);
  if(!gameWeeks || gameWeeks.length === 0 ) {
    throw new Error(`No game week found for week ${week}`);
  } else if (gameWeeks.length > 1) {
    throw new Error(`Multiple game weeks found for week ${week}`);
  }
  return gameWeeks[0];
};
