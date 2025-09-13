import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

const schema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true }, //main, heat
    letter: { type: String, required: true }, // A, B, C, etc.
    num_cars: { type: Number, required: true }, 
    laps: { type: Number, required: true },
    num_transfers: { type: Number, required: true }, 
    first_transfer_position: { type: Number, required: true }, 
    intermission_lap: { type: Number, required: true }, 
  },
  { 
    collection: 'races',
    versionKey: false, // 👈 disables __v
   }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('Race', schema);
export const RaceModel = model;
export type RaceDoc = typeof types.server;
export type RaceClientType = typeof types.client;