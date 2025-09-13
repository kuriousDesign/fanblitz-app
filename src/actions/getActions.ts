"use server";

import connectToDb from '@/lib/db';

import { EventModel, EventDoc, EventClientType } from '@/models/reference/Event';
import { GameModel, GameDoc, GameClientType, GamePicksClientType } from '@/models/reference/Game';
import { PaymentModel, PaymentDoc, PaymentClientType } from '@/models/reference/Payment';
import { PickModel, PickDoc, PickClientType } from '@/models/reference/Pick';
import { PlayerModel, PlayerDoc, PlayerClientType } from '@/models/Player';
import { RaceModel, RaceDoc, RaceClientType } from '@/models/reference/Race';
import { DriverModel, DriverDoc, DriverClientType } from '@/models/reference/Driver';
import { RacerModel, RacerDoc, RacerClientType, RacerDriverClientType } from '@/models/reference/Racer';


import { createClientSafeGetAllHandler, createClientSafeGetHandler, createDocumentGetHandler } from '@/utils/actionHelpers';
import { Types } from 'mongoose';
import { toClientObject } from '@/utils/mongooseHelpers';

import { auth } from '@/auth';
import { HardChargerTableModel, HardChargerTableClientType } from '@/models/reference/HardChargerTable';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { CacheTags } from '@/lib/cache-tags';

export const getConnectToDb = async () => {await connectToDb();}

export const getDriver = createClientSafeGetHandler<DriverDoc,DriverClientType>(DriverModel);
export const getDrivers = createClientSafeGetAllHandler<DriverDoc, DriverClientType>(DriverModel);
export const getEvent = createClientSafeGetHandler<EventDoc, EventClientType>(EventModel);
export const getEvents = createClientSafeGetAllHandler<EventDoc, EventClientType>(EventModel);
export const getGame = createClientSafeGetHandler<GameDoc,GameClientType>(GameModel);
export const getGameServer = createDocumentGetHandler<GameDoc>(GameModel);
export const getGames = createClientSafeGetAllHandler<GameDoc, GameClientType>(GameModel);
export const getPayment = createClientSafeGetHandler<PaymentDoc, PaymentClientType>(PaymentModel);
export const getPayments = createClientSafeGetAllHandler<PaymentDoc, PaymentClientType>(PaymentModel);
export const getPick = createClientSafeGetHandler<PickDoc, PickClientType>(PickModel);
export const getPicks = createClientSafeGetAllHandler<PickDoc, PickClientType>(PickModel);
export const getPlayer = createClientSafeGetHandler<PlayerDoc, PlayerClientType>(PlayerModel);
export const getPlayers = createClientSafeGetAllHandler<PlayerDoc, PlayerClientType>(PlayerModel);
export const getRace = createClientSafeGetHandler<RaceDoc, RaceClientType>(RaceModel);
export const getRaces = createClientSafeGetAllHandler<RaceDoc, RaceClientType>(RaceModel);
export const getRacer = createClientSafeGetHandler<RacerDoc, RacerClientType>(RacerModel);
export const getRacers = createClientSafeGetAllHandler<RacerDoc, RacerClientType>(RacerModel);


// this will retrieve the game info from mongoDB and return the game object with the event info 
export const getGameWithEvent = async (gameId: string) => {
  "use cache";
  cacheTag(CacheTags.GAMES, CacheTags.EVENTS);
  
  await connectToDb();
  const game = await getGame(gameId);
  const event = await getEvent(game.event_id);
  const data = {
    game: game as GameClientType,
    event: event as EventClientType,
  };

  return data;
};

export const getGamesByStatus = async (status: string): Promise<GameClientType[]> => {
  const filter = { status: status };
  const games = getGames(filter);
  //console.log('getGamesByStatus', status, games);
  return games;
}

export const getGamesByEventId = async (eventId: string): Promise<GameClientType[]> => {
  await connectToDb();
  const docs = await GameModel.find({ event_id: new Types.ObjectId(eventId) });
  return docs.map((doc) => toClientObject<GameClientType>(doc));
}


export const getGamePicksByPlayerId = async (playerId: string): Promise<GamePicksClientType[]> => {
  await connectToDb();
  const gamePicks = [] as GamePicksClientType[];
  const filter = { player_id: new Types.ObjectId(playerId) };
  const picks = await getPicks(filter);
  const gameIds = Array.from(new Set(picks.map(pick => pick.game_id.toString())));
  // remove duplicates from gameIds
  const uniqueGameIds = Array.from(new Set(gameIds));
  
  if( uniqueGameIds.length === 0) {
    //console.warn(`No game IDs found for player ${playerId}`);
    return gamePicks; // Return empty array if no game IDs found
  }
  for (const gameId of uniqueGameIds) {
    const game = await getGame(gameId);
    if (game) {
      const gamePicksData: GamePicksClientType = {
        game: game as GameClientType,
        picks: picks.filter(pick => pick.game_id === gameId)
      };
      gamePicks.push(gamePicksData);
    } else {
      console.warn(`Game with ID ${gameId} not found for player ${playerId}`);
    }
  }
  return gamePicks;
}

export const getRacesByEventIdOld = async (eventId: string): Promise<RaceClientType[]> => {
  await connectToDb();
  const raceDocs = await RaceModel.find({ event_id: new Types.ObjectId(eventId) });
  const races = raceDocs.map((doc) => toClientObject<RaceClientType>(doc));
  return races;
};

export const getRacesByEventId = async (eventId: string): Promise<RaceClientType[]> => {
  const filter = { event_id: new Types.ObjectId(eventId) };
  const races = await getRaces(filter);
  return races as RaceClientType[];
  //console.log('getRacesByEventId',
}

export const getRacersByRaceId = async (raceId: string): Promise<RacerClientType[]>  => {
  const filter = { race_id: new Types.ObjectId(raceId) };
  const racers = await getRacers(filter);
  return racers;
}

export const getDriversNotInRace = async (raceId: string): Promise<DriverClientType[]>  => {
  const allDrivers = await getDrivers();
  const racers = await getRacersByRaceId(raceId);
  const racerDriverIds = new Set(racers.map(racer => racer.driver_id));
  const availableDrivers = allDrivers.filter(driver => driver._id && !racerDriverIds.has(driver._id.toString()));
  return availableDrivers as DriverClientType[];
};



export const getRacersWithDriversByRaceId = async (raceId: string): Promise<RacerDriverClientType[]>  => {

  const racers = await getRacersByRaceId(raceId);
  //console.log('getRacersWithDriversByRaceId', raceId, racers.length, racers);

  const racerDrivers = [] as RacerDriverClientType[];
  if (racers.length === 0) {
    console.warn('No racers found');
    return racerDrivers;
  }

  // get drivers for each racer
  for (const racer of racers) {
    // get driver by driver ID
    const driver = await getDriver(racer.driver_id);
    if (driver) {
      // Combine racer and driver into a single object
      racerDrivers.push({
        racer: racer as RacerClientType,
        driver: driver as DriverClientType
      });
    } else {
      console.warn(`Driver with ID ${racer.driver_id} not found for racer ${racer._id}`);
      throw new Error(`Driver with ID ${racer.driver_id} not found`);
    }
  }
  return racerDrivers as RacerDriverClientType[];
};

export const getPicksByPlayerId = async (playerId: string) => {
  const filter = { player_id: new Types.ObjectId(playerId) };
  return getPicks(filter);
}

export const getPicksWithGamesByPlayerId = async (playerId: string) => {
  const filter = { player_id: new Types.ObjectId(playerId) };
  const picks = await getPicks(filter);

  
  // Extract unique game IDs from picks
  const gameIds = Array.from(new Set(picks.map(pick => pick.game_id.toString())));
  // Fetch matching games
  const games = [] as GameClientType[];
  for (const gameId of gameIds) {
    const game = await getGame(gameId);
    if (game) {
      games.push(game);
    }
  }

  return {
    picks: picks,
    games: games,
  };
}
export const getPicksByPlayerIdAndGameStatus = async (playerId: string, gameStatus: string) => {
  const filter = {
    player_id: new Types.ObjectId(playerId),
    game_status: gameStatus
  };
  return getPicks(filter);
}

export const getRacersWithDriversForPickCreation = async (gameId: string) => {
  // gather all raceIds for the game
  const game = await getGame(gameId) as GameClientType;
  const raceIds = game.races;
  const racerDrivers = [] as RacerDriverClientType[];
  for (const raceId of raceIds) {
    const racerDriver = await getRacersWithDriversByRaceId(raceId);
    racerDrivers.push(...racerDriver);
  }

  if (racerDrivers.length === 0) {
    console.warn('No racers found for game', gameId);
    return racerDrivers;
  }

  // get rid of multiple racers with the same driver or any driver where last_names starts with transfer
  const uniqueRacerDrivers = new Map<string, RacerDriverClientType>();
  for (const racerDriver of racerDrivers) {
    const driverId = racerDriver?.driver?._id ? racerDriver.driver._id : '';
    if (!uniqueRacerDrivers.has(driverId) && !racerDriver.driver.last_name.startsWith('Transfer')) {
      uniqueRacerDrivers.set(driverId, racerDriver);
    }
  }
  // Convert the map values back to an array
  racerDrivers.length = 0; // Clear the original array
  uniqueRacerDrivers.forEach((value) => {
    racerDrivers.push(value);
  });
  //console.log('getRacersWithDriversForPickCreation', racerDrivers);


  return racerDrivers as RacerDriverClientType[];
};


// export const getPlayerByUserId = async (userId: string): Promise<PlayerClientType> => {
//   const filter = { user_id: userId }; //in this case userId is saved as a string in the database
//   const players = await getPlayers(filter);
//   if (players.length === 0) {
//     console.log(`No player found with user_id: ${userId}, creating a new player`);
//     throw new Error(`No player found with user_id: ${userId}`);
//     // If no player is found, create a new player

//   } else if (players.length > 1) {
//     console.warn(`Multiple players found with user_id: ${userId}, returning the first one`);
//   }
//   // Assuming user_id is unique, we take the first player
//   const player = players[0]; // Assuming user_id is unique, we take the first player
//   return player as PlayerClientType;
// };

export const getUser = async () => {
  const session = await auth();
  if (!session || !session.user) {
    console.log('No user found in auth session');
    return null; // Return null if no user is found
  }
  //console.log('currentUser', session.user);
  // i want to add a field to the user object called id that is the same as the user_id
  //return an object tha adds a field id to session.user object
  const userObject = {
    ...session.user,
    id: session.user.email
  };
  return userObject; // Return the user object with the added id field
};

export const getCurrentPlayer = async (): Promise<PlayerClientType> => {
  const user = await getUser();
  if (!user) {
    console.warn('No user found in session, waiting for middleware to redirect');
    // retur empty player object
    return {} as PlayerClientType; // Return an empty player object if no user is found
  }
  if(!user.id) {
    console.warn('No user found or user ID is missing');
    return {} as PlayerClientType; // Return an empty player object if no user ID is found}
  }
  // search players documents for user_id = user.id
  const filter = { user_id: user.id }; // in this case userId is saved as a string in the database
  const players = await getPlayers(filter);
  if (!players || !players[0]) {
    //throw new Error(`getCurrentPlayer() No player found with user_id: ${user.id}`);
    console.warn(`getCurrentPlayer() No player found with user_id: ${user.id}`);
    return {} as PlayerClientType; // Return an empty player object if no user ID is found}
  }
  return players[0] as PlayerClientType;
};

export const getUserFullName = async (): Promise<string> => {
  const user = await getUser();
  if (!user) {
    throw new Error(`No user found with user_id`);
  }
  return user.name || '';
};

// this will get picks by gameId and sort them by score_total in descending order (winner's first)
export const getPicksByGameId = async (gameId: string): Promise<PickClientType[]> => {
  const filter = { game_id: new Types.ObjectId(gameId) };
  const picks = await getPicks(filter);
  // arrange picks by score_total in descending order
  picks.sort((a, b) => b.score_total - a.score_total);
  return picks as PickClientType[];
}

export const getRacesByGameId = async (gameId: string): Promise<RaceClientType[]> => {
  const game = await getGame(gameId) as GameClientType;
  // get all races in game.races array of ObjectId
  const races = [] as RaceClientType[];
  for (const raceId of game.races) {
    const race = await getRace(raceId);
    if (race) {
      races.push(race);
    }
  }
  return races;
}


export const getOpenGames = async (): Promise<GameClientType[]> => {
  const filter = { status: 'open' };
  const games = await getGames(filter);
  return games as GameClientType[];
}

export const getHardChargerTable = async (gameId: string): Promise<HardChargerTableClientType | null> => {
  await connectToDb();
  const hardChargerTable = await HardChargerTableModel.findOne({ game_id: new Types.ObjectId(gameId) });
  if (!hardChargerTable) {
    //throw new Error(`No hard charger table found for game_id: ${gameId}`);
    return null; // Return null if no table is found
  }
  return toClientObject<HardChargerTableClientType>(hardChargerTable);
}
