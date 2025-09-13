// utils/types.ts
import { Types } from 'mongoose';

export type Simplify<T> = { [K in keyof T]: T[K] };

export type ClientSafe<T> = Simplify<{
  [K in keyof T]: T[K] extends Types.ObjectId
    ? string
    : T[K] extends Types.ObjectId[]
    ? string[]
    : T[K] extends object
    ? ClientSafe<T[K]>
    : T[K];
}>;
