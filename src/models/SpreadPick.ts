import mongoose, { InferSchemaType } from 'mongoose';
import { createModel } from '@/lib/createModel';

const matchupSpreadPredictionSchema = new mongoose.Schema({
  matchup_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  selection: { type: String, required: true },
  createdOn: { type: String, required: true },
  updatedOn: { type: String, required: true },
  spread_points: { type: Number, required: true }, //whatever the spread was at the time of the pick for the favorite team
  spread_favorite_team: { type: String, required: true },  // team that is favored at the time of the pick
  score: { type: Number, default: 0 }, // Score for this prediction, calculated during the game, 1.0 for correct, 0 for incorrect
});

const spreadPickSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Your name, default is what is found in the user profile
    nickname: { type: String, required: true },
    player_id: { type: mongoose.Schema.Types.ObjectId, required: true }, //(not in form)
    game_week_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // (not in form)

    matchup_spread_predictions: { type: [matchupSpreadPredictionSchema], required: true }, // array of topFinsher objects
    score_total: { type: Number, default: 0 }, // Total score calculated during game not in form
    outcome: { type: Object, default: {} }, // Outcome of the pick, e.g., 'won', 'lost', 'pending'
    is_paid: { type: Boolean, default: false }, // Indicates if the pick has been paid out (not in form)
    status: { type: String, default: 'pending' }, // Status of the pick, e.g., 'pending', 'scored', 'won'
    rank: { type: Number, default: 0, required: true }, // where they placed in the game
    payout: { type: Number, default: 0 }, // Payout amount for the pick, if applicable (not in form)
    message: { type: String, default: '', required: false }, // Optional message for additional context (not in form)

  },
  {
    collection: 'spreadPicks',
    versionKey: false, // 👈 disables __v
  }
);

export type MatchupSpreadPredictionClientType = Omit<InferSchemaType<typeof matchupSpreadPredictionSchema>, 'matchup_id'> & { matchup_id: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('SpreadPick', spreadPickSchema);
export const SpreadPickModel = model;
export type SpreadPickDoc = typeof types.server;
type SpreadPickClientTypeUnconverted = typeof types.client;
export type SpreadPickClientType = Omit<SpreadPickClientTypeUnconverted, 'matchup_spread_predictions'> & {
  matchup_spread_predictions: MatchupSpreadPredictionClientType[];
};

