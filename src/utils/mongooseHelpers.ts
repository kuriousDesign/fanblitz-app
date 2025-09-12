import mongoose, { Document, Types } from 'mongoose';

/**
 * Recursively converts a Mongoose document or plain object into an object that is able to be serialized by the server and passed to the client.
 * - Converts ObjectId to string
 * - Converts Date to ISO 8601 string
 * - Handles arrays and nested structures
 */
export function toClientObject<T>(input: unknown): T {
  if (input instanceof Types.ObjectId) {
    return input.toString() as unknown as T;
  }

  if (input instanceof Date) {
    return input.toISOString() as unknown as T; // Convert Date to ISO string
  }

  if (Array.isArray(input)) {
    return input.map((item) => toClientObject(item)) as unknown as T;
  }

  if (input instanceof mongoose.Model || (input as Document)?.toObject) {
    input = (input as Document).toObject();
  }

  if (input && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const value = (input as Record<string, unknown>)[key];
        result[key] = toClientObject(value);
      }
    }
    return result as T;
  }

  return input as T;
}