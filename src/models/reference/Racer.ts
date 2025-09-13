import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';
import { DriverClientType } from './Driver';



const schema = new mongoose.Schema(
  {
    race_id:  { type: mongoose.Schema.Types.ObjectId, required: true },
    driver_id:  { type: mongoose.Schema.Types.ObjectId, required: true },
    starting_position: { type: Number, required: true },
    current_position: { type: Number, required: true },
  },
  { collection: 'racers',
    versionKey: false, // 👈 disables __v
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('Racer', schema);
export const RacerModel = model;
export type RacerDoc = typeof types.server;
export type RacerClientType = typeof types.client;

export interface RacerDriverClientType {
  racer: RacerClientType;
  driver: DriverClientType;
}