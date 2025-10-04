
import { DriverClientType, DriverDoc } from '@/models/reference/Driver';
import { Types } from 'mongoose';
import { Hometown } from './globals';
import { GameWeekClientType } from '@/models/GameWeek';

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


// return the day that is saturday of the given game week, it will be between start_date and end_date
export function getSaturdayOfGameWeek(gameWeek:GameWeekClientType) : Date | null {
  if (!gameWeek.start_date || !gameWeek.end_date) return null;

  const startDate = new Date(gameWeek.start_date);
  const endDate = new Date(gameWeek.end_date);

  // Find the first Saturday on or after the start date
  while (startDate.getUTCDay() !== 6) {
    startDate.setUTCDate(startDate.getUTCDate() + 1);
  }

  // Check if the Saturday is within the game week
  if (startDate <= endDate) {
    return startDate;
  }

  return null;
}