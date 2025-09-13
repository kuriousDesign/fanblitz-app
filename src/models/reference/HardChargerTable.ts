import mongoose, { InferSchemaType } from 'mongoose';
import { createModel } from '@/lib/createModel';

const hardChargerEntrySchema = new mongoose.Schema({
    driver_id:  { type: mongoose.Schema.Types.ObjectId, required: true },
    driver_name: { type: String, required: true },
    total_cars_passed: { type: Number, required: true },
    cars_passed_by_race: { type: [Number], required: true },
    rank: { type: Number, default: 0 }, // Rank of the driver in the leaderboard
}, {
  _id: false, // Disable automatic _id generation for this subdocument
  versionKey: false, // Disable __v for this subdocument

});

const schema = new mongoose.Schema(
  {
    game_id:  { type: mongoose.Schema.Types.ObjectId, required: true },
    entries: { type: [hardChargerEntrySchema], required: true }, 
  },
  { collection: 'hardchargertables',
    versionKey: false, // 👈 disables __v
  }
);

export type HardChargerEntryClientType = Omit<InferSchemaType<typeof hardChargerEntrySchema>, 'driver_id'> & { driver_id: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('HardChargerTable', schema);
export const HardChargerTableModel = model;
export type HardChargerTableDoc = typeof types.server;

type ClientTypeUnconverted = typeof types.client;
export type HardChargerTableClientType = Omit<ClientTypeUnconverted, 'entries'> & {
  entries: HardChargerEntryClientType[];
};