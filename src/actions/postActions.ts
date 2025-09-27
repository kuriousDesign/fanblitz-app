'use server'

import connectToDb from '@/lib/db';
import { DriverModel, DriverClientType, DriverDoc } from '@/models/reference/Driver'
import { EventModel, EventClientType } from '@/models/reference/Event';
import { GameModel, GameClientType, GameDoc } from '@/models/reference/Game';
import { PaymentClientType } from '@/models/reference/Payment';
import { PlayerModel, PlayerDoc, PlayerClientType } from '@/models/Player';
import { RaceModel, RaceDoc, RaceClientType } from '@/models/reference/Race';
import { RacerModel, RacerClientType, RacerDoc } from '@/models/reference/Racer';

import { Types } from 'mongoose';
import { createDeleteHandler, createClientSafePostHandler } from '@/utils/actionHelpers';
import { PickClientType, PickDoc, PickModel } from '@/models/reference/Pick';
import parseDriverData from '@/data/parseDriverData';

import { drivers as driversData } from '@/data/drivers';
import { HardChargerTableClientType, HardChargerTableDoc, HardChargerTableModel } from '@/models/reference/HardChargerTable';
import { redirect } from 'next/navigation';
import { getLinks } from '@/lib/link-urls';

import { Roles } from '@/types/enums';
import { checkIsAdminByEmail } from '@/lib/utils';

import type { DefaultUser } from '@auth/core/types';
import { revalidateTag } from 'next/cache';
import { CacheTags } from '@/lib/cache-tags';



// admin role protected
export const postDriver = createClientSafePostHandler<DriverClientType>(DriverModel);
export const deleteDriver = createDeleteHandler<DriverDoc>(DriverModel);
export const deleteGame = createDeleteHandler<GameDoc>(GameModel);


export const postEvent = async (event: Partial<EventClientType> & { _id?: string }) => {
  await connectToDb();

  const eventData = {
    name: event.name?.trim() || '',
    date: event.date || new Date(),
    location: event.location?.trim() || '',
  };

  try {
    if (event._id) {
      await EventModel.findByIdAndUpdate(event._id, eventData, { new: true });
      return { message: 'Event updated successfully' };
    } else {
      const newEvent = new EventModel(eventData);
      await newEvent.save();
      return { message: 'Event created successfully' };
    }
  } catch (error) {
    console.error('Event save error:', error);
    throw new Error('Failed to save event');
  }
}

export const postPayment = async (payment: Partial<PaymentClientType> & { _id?: string }) => {
  await connectToDb();
  const paymentData = {
    name: payment.name?.trim() || '',
    pick_id: payment.pick_id ? new Types.ObjectId(payment.pick_id) : undefined,
    type: payment.type?.trim() || '',
    transaction_id: payment.transaction_id?.trim() || '',
    amount: payment.amount || 0,
    log: payment.log || [],
  };
  console.log('Posting payment:', paymentData);
  try {
    const { PaymentModel } = await import('@/models/reference/Payment');
    if (payment._id) {
      // dynamic import to avoid circular dependency
      
      // Update existing payment
      await PaymentModel.findByIdAndUpdate(payment._id, paymentData, { new: true });
      return { message: 'Payment updated successfully' };
    } else {  
      const newPayment = new PaymentModel(paymentData);
      await newPayment.save();
      return { message: 'Payment created successfully' };
    }
  } catch (error) {
    console.error('Payment save error:', error);
    throw new Error('Failed to save payment');
  }
}



export const postRace = async (race: Partial<RaceDoc | RaceClientType> & { _id?: string }) => {
  await connectToDb();

  // check if event_id is a valid ObjectId, if its a string then convert it
  if (typeof (race.event_id) === 'string') {
    race.event_id = new Types.ObjectId(race.event_id as string);
  }

  const raceData = {
    letter: race.letter?.trim() || '',
    type: race.type?.trim() || '',
    event_id: race.event_id,
    status: race.status?.trim() || 'lineup', // default status
    num_cars: race.num_cars || 0,
    laps: race.laps || 0,
    num_transfers: race.num_transfers || 0,
    first_transfer_position: race.first_transfer_position || 0,
    intermission_lap: race.intermission_lap || 0,
  };

  try {
    if (race._id) {
      await RaceModel.findByIdAndUpdate(race._id, raceData, { new: true });
      return { message: 'Race updated successfully' };
    } else {
      const newRace = new RaceModel(raceData);
      await newRace.save();
      return { message: 'Race created successfully' };
    }
  } catch (error) {
    console.error('Race save error:', error);
    throw new Error('Failed to save race');
  }
}

export const postGame = async (game: Partial<GameDoc | GameClientType> & { _id?: string }) => {
  await connectToDb();

  // Convert string IDs to ObjectId
  if (typeof game.event_id === 'string') {
    game.event_id = new Types.ObjectId(game.event_id);
  }

  if (Array.isArray(game.races)) {
    game.races = game.races.map(id => new Types.ObjectId(id));
  }

  const { _id, ...rest } = game;

  if (_id && _id !== '') {
    // Update existing game
    await GameModel.findByIdAndUpdate(_id, rest, { new: true });
    return { message: 'Game updated successfully' };
  } else {
    // Strip _id when creating a new document
    const newGame = new GameModel(rest);
    await newGame.save();
    return { message: 'Game created successfully' };
  }
};

export const postPick = async (pick: Partial<PickDoc | PickClientType> & { _id?: string }) => {
  await connectToDb();

  // Convert string IDs to ObjectId
  if (typeof pick.game_id === 'string') {
    pick.game_id = new Types.ObjectId(pick.game_id);
  }
  if (typeof pick.player_id === 'string') {
    pick.player_id = new Types.ObjectId(pick.player_id);
  }

  const { _id, ...rest } = pick;
  try {
    if (_id && _id !== '') {
      // Update existing pick
      await PickModel.findByIdAndUpdate(_id, rest, { new: true });
      return { message: 'Pick updated successfully' };
    } else {
      // Strip _id when creating a new document
      const newPick = new PickModel(rest);
      await newPick.save();
      return { message: 'Pick created successfully' };
    }
  }
  catch (error) {
    console.error('Pick save error:', error);
    throw new Error('Failed to save pick');
  }
}

export const handlePickFormSubmit = async (pick: PickClientType, gameId: string) => {
  try {
    console.log('posting pick:', pick);
    await postPick(pick);
    console.log('Pick posted to DB successfully');
  } catch (err) {
    console.error('Error posting pick:', err);
    throw new Error('Failed to submit pick');
  }
  redirect(getLinks().getGameUrl(gameId)); // Let NEXT_REDIRECT propagate
};

export const postHardChargerTable = async (hardChargerTable: Partial<HardChargerTableDoc | HardChargerTableClientType> & { _id?: string }) => {
  await connectToDb();
  // Convert game_id to ObjectId if it's a string
  if (typeof hardChargerTable.game_id === 'string') {
    hardChargerTable.game_id = new Types.ObjectId(hardChargerTable.game_id);
  }

  try {
    const existingTable = await HardChargerTableModel.findOne({ game_id: hardChargerTable.game_id });

    if (existingTable) {
      // Update existing table
      await HardChargerTableModel.findByIdAndUpdate(existingTable._id, hardChargerTable, { new: true });
      console.log('Hard Charger Table updated successfully');
      return { message: 'Hard Charger Table updated successfully' };
    } else {
      // Create new table
      const newTable = new HardChargerTableModel(hardChargerTable);
      console.log('Creating new Hard Charger Table');
      await newTable.save();
      return { message: 'Hard Charger Table created successfully' };
    }
  } catch (error) {
    console.error('Hard Charger Table save error:', error);
    throw new Error('Failed to save Hard Charger Table');
  }
};

export const postRacer = async (racer: Partial<RacerDoc | RacerClientType> & { _id?: string }) => {
  await connectToDb();

  // Convert string IDs to ObjectId
  if (typeof racer.driver_id === 'string') {
    racer.driver_id = new Types.ObjectId(racer.driver_id);
  }
  const { _id, ...rest } = racer;
  if (_id && _id !== '') {
    // Update existing racer
    await RacerModel.findByIdAndUpdate(_id, rest, { new: true });
    return { message: 'Racer updated successfully' };
  } else {
    // Strip _id when creating a new document
    const newRacer = new RacerModel(rest);
    await newRacer.save();
    return { message: 'Racer created successfully' };
  }
};

export const postPlayer = async (player: Partial<PlayerDoc | PlayerClientType> & { _id?: string }) => {
  await connectToDb();
        const thisCacheTag = 'players';
        //if thisCacheTag exists in CacheTags enum, revalidate it
        if (thisCacheTag in CacheTags) {
          console.log(`Revalidating tag: ${thisCacheTag}`);
          revalidateTag(thisCacheTag);
        }

  const { _id, ...rest } = player;
  if (_id && _id !== '') {
    // Update existing player
    await PlayerModel.findByIdAndUpdate(_id, rest, { new: true });
    return { message: 'Player updated successfully' };
  } else {
    // Strip _id when creating a new document
    const newPlayer = new PlayerModel(rest);
    await newPlayer.save();
    return { message: 'Player created successfully' };
  }
}

export const postNewPlayerWithUser = async (user:DefaultUser) => {
  await connectToDb();
  //const user = await getUser();
  
  if (!user || !user.email || !user.id) {
    throw new Error('User not found or userId is invalid');
  }
  // Check if player already exists
  const existingPlayer = await PlayerModel.findOne({ user_id: user.id });
  if (existingPlayer) {
    return { message: 'Player already exists', player: existingPlayer };
  }

  // Create new player

  const isAdmin = checkIsAdminByEmail(user.email);
  const role = isAdmin ? Roles.ADMIN : Roles.USER;

  const newPlayer = new PlayerModel({
    user_id: user.email,
    email: user.email,
    image: user.image || '', // Use image_url from user if available
    role: role,
    name: user?.name,
    phone_number: 0, // Default number, can be updated later
    private_games: [] // Initialize with an empty array
  });
  await newPlayer.save();
  console.log('Creating new player for user_id:', user.id, newPlayer);

  return { message: 'New player created successfully', player: newPlayer };
}


export const postDriversFromDataFolder = async () => {
  //using driversData, insert drivers into the database, skipping duplicates
  await connectToDb();
  if (driversData.length === 0) {
    return { success: false, message: 'No valid drivers found in the data' };
  } else {
    //const result = await DriverModel.insertMany(driversData);
    // insert the drivers, but skip duplicates
    const result = await DriverModel.bulkWrite(
      driversData.map(driver => ({
        updateOne: {
          filter: { car_number: driver.car_number },
          update: { $setOnInsert: driver },
          upsert: true
        }
      }))
    );
    if (result.upsertedCount === 0) {
      return { success: false, message: 'No new drivers added, all were duplicates' };
    }
    console.log(`Inserted ${result.upsertedCount} new drivers`);
    return { success: true, message: `Inserted ${result.upsertedCount} new drivers`, count: result.upsertedCount };
  }

};

// Update an existing driver
export async function updateDriver(id: string, data: DriverClientType) {
  try {
    await connectToDb();
    const updatedDriver = await DriverModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!updatedDriver) {
      throw new Error('Driver not found');
    }
    return JSON.parse(JSON.stringify(updatedDriver)); // Serialize for Next.js
  } catch (error) {
    console.error('Error updating driver:', error);
    throw new Error('Failed to update driver');
  }
}

// extract drivers from data/drivers_2025.txt using parseDriverData() and post to drivers collection
export const postDriversFromTextFile = async (filePath: string) => {
  await connectToDb();
  // read the file that is in src/data/drivers_2025.txt
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath, 'utf8');


  const drivers = parseDriverData(fileContent);
  if (drivers.length === 0) {
    return { success: false, message: 'No valid drivers found in the file' };
  } else {
    //const result = await DriverModel.insertMany(drivers);
    // insert the drivers, but skip duplicates
    const result = await DriverModel.bulkWrite(
      drivers.map(driver => ({
        updateOne: {
          filter: { car_number: driver.car_number },
          update: { $setOnInsert: driver },
          upsert: true
        }
      }))
    );
    if (result.upsertedCount === 0) {
      return { success: false, message: 'No new drivers added, all were duplicates' };
    }
    console.log(`Inserted ${result.upsertedCount} new drivers`);
    return { success: true, message: `Inserted ${result.upsertedCount} new drivers`, count: result.upsertedCount };
  }
};