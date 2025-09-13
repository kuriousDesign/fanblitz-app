import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

// i want to force the dates to be stored as ISO strings in the db
// this is because the dates coming from the odds api are strings
// and i want to avoid timezone issues with Date objects

const matchupSchema = new mongoose.Schema(
  {
    game_week_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    api_source: { type: String, required: true },
    api_game_id: { type: String, required: true }, // the id from the source api that points to the actual football game
    sport: { type: String, required: true },
    home_team: { type: String, required: true },
    away_team: { type: String, required: true },
    game_date: { type: String, required: true },
    //week: { type: Number, required: true },
    //season: { type: Number, required: true },
    bookmaker: { type: String, required: true },
    spread: { type: Number, required: true },
    spread_date: { type: String, required: true},
    spread_favorite_team: {type: String, required: true },
    can_be_picked: {type: String, required: true }, //admin allows users to pick this game or not
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