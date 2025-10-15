import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // player name
    user_id : { type: String, required: true }, // user id from the users collection from clerk (this is typically the email)
    phone_number: { type: Number, required: false }, // 
    image: { type: String, required: false }, // player image URL
    email: { type: String, required: true }, // player email
    role: { type: String, required: true }, // e.g., Roles enum
    private_games: { type: [mongoose.Schema.Types.ObjectId], required: true }, // array of private game ids the user can access
    free_picks_earned: { type: Number, required: false, default: 0 }, // number of free picks earned
    free_picks_used: { type: Number, required: false, default: 0 }, // number of free picks used
  },
  { collection: 'players',
    versionKey: false, // 👈 disables __v
   }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('Player', schema);
export const PlayerModel = model;
export type PlayerDoc = typeof types.server;
export type PlayerClientType = typeof types.client;