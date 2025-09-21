'use server'

import { SpreadPickClientType, SpreadPickDoc, SpreadPickModel } from "@/models/SpreadPick";
import { createClientSafePostHandler } from "@/utils/actionHelpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postSpreadPickSimple = createClientSafePostHandler<SpreadPickClientType>(SpreadPickModel as any);

export const postSpreadPick = async (pick: Partial<SpreadPickDoc | SpreadPickClientType> & { _id?: string }): Promise<SpreadPickClientType> => {
  const clientPick: Partial<SpreadPickClientType> = {
    ...pick,
    player_id: typeof pick.player_id === 'string' ? pick.player_id : pick.player_id?.toString(),
    game_week_id: typeof pick.game_week_id === 'string' ? pick.game_week_id : pick.game_week_id?.toString(),
    matchup_spread_predictions: pick.matchup_spread_predictions?.map(prediction => ({
      ...prediction,
      matchup_id: typeof prediction.matchup_id === 'string' ? prediction.matchup_id : prediction.matchup_id?.toString()
    }))
  };
  // check if any entries that match the game_week_id and player_id existing
  const existingDoc = await SpreadPickModel.findOne({ game_week_id: clientPick.game_week_id, player_id: clientPick.player_id });
  //if existing Doc, then don't create a new one, just update it
  if (existingDoc) {
    clientPick._id = existingDoc._id.toString();
    console.log('updating existing pick with id', clientPick._id);
  } else {
    console.log('creating new pick for game week', clientPick.game_week_id);
  }

  await postSpreadPickSimple(clientPick as SpreadPickClientType);
  return clientPick as SpreadPickClientType;
};

export const postSpreadPicks = async (picks: (Partial<SpreadPickDoc | SpreadPickClientType> & { _id?: string })[]) => {
  // i want to post more than one matchup
  const promises = picks.map(pick => {
    const clientPick: Partial<SpreadPickClientType> = {
      ...pick,
      player_id: typeof pick.player_id === 'string' ? pick.player_id : pick.player_id?.toString(),
      game_week_id: typeof pick.game_week_id === 'string' ? pick.game_week_id : pick.game_week_id?.toString(),
      matchup_spread_predictions: pick.matchup_spread_predictions?.map(prediction => ({
        ...prediction,
        matchup_id: typeof prediction.matchup_id === 'string' ? prediction.matchup_id : prediction.matchup_id?.toString()
      }))
    };
    return postSpreadPick(clientPick);
  });
  await Promise.all(promises);
};