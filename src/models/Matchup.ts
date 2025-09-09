import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

const matchupSchema = new mongoose.Schema(
  {
    source_api: { type: String, required: true },
    game_id: { type: String, required: true }, // unique id from the source api
    sport: { type: String, required: true },
    home_team: { type: String, required: true },
    away_team: { type: String, required: true },
    game_date: { type: Date, required: true },
    week: { type: Number, required: true },
    season: { type: Number, required: true },
    bookmaker: { type: String, required: true },
    spread: { type: Number, required: true },
    spread_favorite_team: {type: String, required: true },
    can_be_picked: {type: String, required: true },
  },
  {
    collection: 'matchups',
    versionKey: false,
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: Matchup, types } = createModel('Matchup', matchupSchema);
export const MatchupModel = Matchup;
export type MatchupDoc = typeof types.server;
export type MatchupClientType = typeof types.client;