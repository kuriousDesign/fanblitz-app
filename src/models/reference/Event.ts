import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';


const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
  },
  { collection: 'events',
    versionKey: false, // 👈 disables __v
   }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: Event, types } = createModel('Event', eventSchema);
export const EventModel = Event;
export type EventDoc = typeof types.server;
export type EventClientType = typeof types.client;