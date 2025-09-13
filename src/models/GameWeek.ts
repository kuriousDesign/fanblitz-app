import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';
import { SpreadPickClientType } from './SpreadPick';


const gameWeekSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true, default: 'created' }, // e.g., 'created', 'open', 'regisration_over', 'active', 'just_finished' 'completed', 'cancelled'
  type: { type: String, required: true }, // e.g., GameWeekTypes enum
  num_selections: { type: Number, required: true },
  max_allowed_free_selections: { type: Number, required: true },
  is_private: { type: Boolean, required: true, default: false }, // whether the game is private or not
  password: { type: String, required: false, default: '' }, // password to access the game,
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  season: { type: Number, required: true },
  week: { type: Number, required: true },
  purse_amount: { type: Number, required: true },
  num_players: { type: Number, required: true } 
}, {
  collection: 'gameWeeks',
  versionKey: false
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: GameWeek, types } = createModel('GameWeek', gameWeekSchema);
export const GameWeekModel = GameWeek;
export type GameWeekDoc = typeof types.server;
export type GameWeekClientType = typeof types.client;


export interface GameWeekPicksClientType {
  game: GameWeekClientType;
  spreadPicks: SpreadPickClientType[];
}