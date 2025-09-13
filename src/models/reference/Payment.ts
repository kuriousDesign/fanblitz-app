import mongoose from 'mongoose';
import { createModel } from '@/lib/createModel';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pick_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    transaction_id: { type: String, required: true }, //vendor specific
    amount: { type: Number, required: true },
    log: { type: [String], required: false }, // vendor specific
  },
  { collection: 'payments',
    versionKey: false, // 👈 disables __v
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { model: model, types } = createModel('Payment', schema);
export const PaymentModel = model;
export type PaymentDoc = typeof types.server;
export type PaymentClientType = typeof types.client;