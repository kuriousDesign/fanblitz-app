import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

// i want to force the dates to be stored as ISO strings in the db
// this is because the dates coming from the odds api are strings
// and i want to avoid timezone issues with Date objects

const spreadPickSchema = new mongoose.Schema(
  {
    player_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    matchup_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    game_week_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    selection: { type: String, required: true },
    createdOn: { type: String, required: true },
    updatedOn: { type: String, required: true },
    spread: { type: Number, required: true }, //whatever the spread was at the time of the pick
    spread_favorite_team: {type: String, required: true },  // team that is favored at the time of the pick
  },
  {
    collection: 'spreadPicks',
    versionKey: false,
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: SpreadPick, types } = createModel('SpreadPick', spreadPickSchema);
export const SpreadPickModel = SpreadPick;
export type SpreadPickDoc = typeof types.server;
export type SpreadPickClientType = typeof types.client;