import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';
import { EventClientType } from './Event';
import { PickClientType } from './Pick';


const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  races: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  status: { type: String, required: true, default: 'created' }, // e.g., 'created', 'open', 'regisration_over', 'active', 'just_finished' 'completed', 'cancelled'
  entry_fee: { type: Number, required: true },
  house_cut: { type: Number, required: true },

  type: { type: String, required: true }, // e.g., GameTypes enum
  num_hard_chargers: { type: Number, required: true, default: 0 }, // number of hard chargers
  num_hard_chargers_predictions: { type: Number, required: true, default: 0 }, // number of hard chargers predictions
  hard_charger_prediction_scale: { type: Number, required: true, default: 0 }, // penalty for not wrong prediction, point per car
  hard_charger_prediction_bonus: { type: Number, required: true, default: 0 }, // penalty for not wrong prediction, point per car
  //hard_charger_prediction_penalty_max: { type: Number, required: true }, // max penalty for not wrong prediction, point per car
  num_top_finishers: { type: Number, required: true },
  num_top_finishers_predictions: { type: Number, required: true },
  top_finisher_baseline_points: { type: Number, required: true }, // baseline points for top finishers
  top_finisher_prediction_penalty: { type: Number, required: true }, // penalty for not wrong prediction, point per car
  top_finisher_prediction_bonus: { type: Number, required: true }, // max penalty for not wrong prediction, point per car
  tie_breaker: { type: Object, required: false }, // tie breaker object, e.g., { type: 'fastest_lap', value: 0 }
  is_private: { type: Boolean, required: true, default: false }, // whether the game is private or not
  password: { type: String, required: false, default: '' }, // password to access the game,

  purse_amount: { type: Number, required: true },
  num_picks: { type: Number, required: true } //update whenver a new pick is made and verified
}, {
  collection: 'games',
  versionKey: false
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: Game, types } = createModel('Game', gameSchema);
export const GameModel = Game;
export type GameDoc = typeof types.server;
export type GameClientType = typeof types.client;

// export function gameClientToDocumentObject(input: Partial<GameClientType> & {_id: string}): Partial<GameDoc> {
//   // Example conversion, extend for your schema
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const output: any = { ...input };
//   if(input._id){
//     if(typeof input._id === 'string') {
//       output._id = new mongoose.Types.ObjectId(input._id);
//     }
//   }
//   if (input.event_id && typeof input.event_id === 'string') {
//     delete output.event_id; // remove event_id if it exists as a string
//     // add event_id as ObjectId
//     output.event_id = new mongoose.Types.ObjectId(input.event_id);
//     console.log('Converted event_id to ObjectId:', output.event_id);
//   }
//   return output as Partial<GameDoc>;
// }

export interface GameEventClientType {
  game: GameClientType;
  event: EventClientType;
}

export interface GamePicksClientType {
  game: GameClientType;
  picks: PickClientType[];
}