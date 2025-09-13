
import { DriverClientType, DriverDoc } from '@/models/reference/Driver';
import { Types } from 'mongoose';
import { Hometown } from './globals';

/**
 * Recursively converts ObjectId and nested types to strings for client usage.
 */
export type ToClient<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId
    ? string
    : T[K] extends Types.ObjectId[]
      ? string[]
      : T[K] extends object
        ? ToClient<T[K]>
        : T[K]
};


export function getDriverFullName(driver: DriverClientType | DriverDoc): string {
  return `${driver.first_name} ${driver.last_name}${driver.suffix ? ` ${driver.suffix}` : ''}`;
}


export function parseHometown(hometown: string): Hometown {
  const [city, region] = hometown.split(', ').map(part => part.trim());
  return { city, region };
}
export function formatHometown({ city, region }: Hometown): string {
  return `${city}, ${region}`;
}
