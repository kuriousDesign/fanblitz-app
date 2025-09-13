import mongoose, { InferSchemaType } from 'mongoose';
import { createModel } from '@/lib/createModel';

const driverPredictionSchema = new mongoose.Schema({
    driver_id:  { type: mongoose.Schema.Types.ObjectId, required: true },
    prediction: { type: Number, required: true },
    score: { type: Number, default: 0 }, // Score for this prediction, calculated during the game

});

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Your name, default is what is found in the user profile
    nickname: { type: String, required: true },
    player_id: { type: mongoose.Schema.Types.ObjectId, required: true }, //(not in form)
    game_id:  { type: mongoose.Schema.Types.ObjectId, required: true }, // (not in form)
    
    top_finishers: { type: [driverPredictionSchema], required: true }, // array of topFinsher objects
    hard_chargers: { type: [driverPredictionSchema], required: true }, // array of hardCharger objects
    tie_breaker: { type: Object, required: false }, // the structure of this object can vary based on game type, e.g.
    score_total: { type: Number, default: 0 }, // Total score calculated during game not in form
    score_top_finishers: { type: Number, default: 0 }, // Score for top finishers calculated during game not in form
    score_hard_chargers: { type: Number, default: 0 }, // Score for hard chargers calculated during game not in form
    score_tie_breaker: { type: Number, default: 0 }, // Score for tie breaker calculated during game not in form
    outcome: { type: Object, default: {} }, // Outcome of the pick, e.g., 'won', 'lost', 'pending'
    is_paid: { type: Boolean, default: false }, // Indicates if the pick has been paid out (not in form)
    status: { type: String, default: 'pending' }, // Status of the pick, e.g., 'pending', 'scored', 'won'
    rank: { type: Number, default: 0, required: true }, // where the placed in the game
    payout: { type: Number, default: 0 }, // Payout amount for the pick, if applicable (not in form)
    message: { type: String, default: '', required: false }, // Optional message for additional context (not in form)

  },
  { collection: 'picks',
    versionKey: false, // 👈 disables __v
   }
);

export type DriverPredictionClientType = Omit<InferSchemaType<typeof driverPredictionSchema>, 'driver_id'> & { driver_id: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('Pick', schema);
export const PickModel = model;
export type PickDoc = typeof types.server;
type PickClientTypeUnconverted = typeof types.client;
export type PickClientType = Omit<PickClientTypeUnconverted, 'hard_chargers' | 'top_finishers'> & {
  hard_chargers: DriverPredictionClientType[];
  top_finishers: DriverPredictionClientType[];
};

// export type PickType = InferSchemaType<typeof pickSchema> & { _id?: string };
// export type PickFormType = Omit<PickType, 'game_id' | 'user_id'> & { game_id: string, user_id: string }; // Used on the client form
// export const Pick = mongoose.models.Pick || model('Pick', pickSchema);