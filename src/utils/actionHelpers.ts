import { Types, Model, FilterQuery } from 'mongoose';
import connectToDb from '@/lib/db';
import { toClientObject } from '@/utils/mongooseHelpers';
import { Roles } from '@/types/globals';
import { revalidateTag, unstable_cacheTag as cacheTag } from 'next/cache';
import { CacheTags } from '@/lib/cache-tags';
import { MatchupClientType } from '@/models/Matchup';
import { MatchupSpreadPredictionClientType } from '@/models/SpreadPick';
import { PredictionRowData } from '@/types/globals';


export const adminRoleProtectedOptions = {
  isRoleProtected: true,
  role: Roles.ADMIN,
};



// GET one document (client-safe)
export const createClientSafeGetHandler = <ServerType, ClientType>(
  model: Model<ServerType>,
) => {
  return async (id: string): Promise<ClientType> => {
 
    const thisCacheTag = `${model.modelName.toLowerCase()}s`;
    //if thisCacheTag exists in CacheTags enum, revalidate it
    if (thisCacheTag in CacheTags) {
      cacheTag(thisCacheTag);
    }

    //await checkRoleProtected(options)();
    await connectToDb();
    const doc = await model.findById(new Types.ObjectId(id));
    if (!doc) throw new Error(`Document with ID ${id} not found`);

    return toClientObject<ClientType>(doc);
  };
};

export const createDocumentGetHandler = <ServerType>(
  model: Model<ServerType>,
) => {
  return async (id: string): Promise<ServerType> => {
  
    const thisCacheTag = `${model.modelName.toLowerCase()}s`;
    //if thisCacheTag exists in CacheTags enum, revalidate it
    if (thisCacheTag in CacheTags) {
      cacheTag(thisCacheTag);
    }
    //await checkRoleProtected(options)();
    await connectToDb();
    const doc = await model.findById(new Types.ObjectId(id));
    if (!doc) throw new Error(`Document with ID ${id} not found`);
    return doc;
  };
};

// GET all documents (client-safe)
export const createClientSafeGetAllHandler = <ServerType, ClientType>(
  model: Model<ServerType>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (filter?: FilterQuery<any>): Promise<ClientType[]> => {

    const thisCacheTag = `${model.modelName.toLowerCase()}s`;
    //if thisCacheTag exists in CacheTags enum, revalidate it
    if (thisCacheTag in CacheTags) {
      cacheTag(thisCacheTag);
    }
    //await checkRoleProtected(options)();
    await connectToDb();
    let docs;
    if (filter) {
      docs = await model.find(filter);
    }
    else {
      docs = await model.find();
    }

    return docs.map((doc) => toClientObject<ClientType>(doc));
  };
};

// GET all documents (server-side)
export const createDocumentGetAllHandler = <ServerType>(
  model: Model<ServerType>,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (filter: FilterQuery<any>): Promise<ServerType[]> => {
 
    const thisCacheTag = `${model.modelName.toLowerCase()}s`;
    //if thisCacheTag exists in CacheTags enum, revalidate it
    if (thisCacheTag in CacheTags) {
      cacheTag(thisCacheTag);
    }
    //await checkRoleProtected(options)();
    await connectToDb();
    let docs;
    if (filter) {
      docs = await model.find(filter);
    }
    else {
      docs = await model.find();
    }
    return docs;
  };
}

//this function has bad logic
export function toDocumentObject<T>(input: Partial<T>): Partial<T> {
  // Example conversion, extend for your schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: any = {};
  for (const key in input) {
    const val = input[key];
    if (typeof val === 'string' && Types.ObjectId.isValid(val)) {
      output[key] = new Types.ObjectId(val);
    } else if (Array.isArray(val)) {
      output[key] = val.map(v => (typeof v === 'string' && Types.ObjectId.isValid(v) ? new Types.ObjectId(v) : v));
    } else {
      output[key] = val;
    }
  }
  return output;
}

export const createClientSafePostHandler = <T extends { _id?: string }>(
  model: Model<T>,
) => {
  return async (clientData: Partial<T>) => {
    //await checkRoleProtected(options)();
    await connectToDb();
    const { _id, ...rest } = clientData;
    const serverData = toDocumentObject<T>(rest as Partial<T>);  // <-- cast here

    if (_id && _id !== '') {
      const updated = await model.findByIdAndUpdate(_id, { $set: serverData }, { new: true });
      if (!updated) throw new Error(`Document with ID ${_id} not found`);
      const thisCacheTag = `${model.modelName.toLowerCase()}s`;
      //if thisCacheTag exists in CacheTags enum, revalidate it
      if (thisCacheTag in CacheTags) {
        console.log(`Revalidating tag: ${thisCacheTag}`);
        revalidateTag(thisCacheTag);
      }

      //return { message: 'Updated successfully' };
      return toClientObject(updated);
    } else {
      const created = new model(serverData);
      await created.save();
      const thisCacheTag = `${model.modelName.toLowerCase()}s`;
      //if thisCacheTag exists in CacheTags enum, revalidate it
      if (thisCacheTag in CacheTags) {
        console.log(`Revalidating tag: ${thisCacheTag}`);
        revalidateTag(thisCacheTag);
      }
      return toClientObject(created);
    }
  };
};

// DELETE
export const createDeleteHandler = <T extends { _id?: string }>(
  model: Model<T>,
) => {
  return async (id: string) => {
    await connectToDb();
    const deleted = await model.findByIdAndDelete(new Types.ObjectId(id));
    if (!deleted) throw new Error(`Document with ID ${id} not found`);
    const thisCacheTag = `${model.modelName.toLowerCase()}s`;
    //if thisCacheTag exists in CacheTags enum, revalidate it
    if (thisCacheTag in CacheTags) {
      console.log(`Revalidating tag: ${thisCacheTag}`);
      revalidateTag(thisCacheTag);
    }
    return { message: 'Deleted successfully' };
  };
};


export function buildPlayerPickTableRowData(matchup: MatchupClientType, prediction: MatchupSpreadPredictionClientType, index: number): PredictionRowData {

    const isCorrect = (prediction.selection + '_team') === matchup.winner;
    const isSpreadFavorite = (matchup.spread_favorite_team === (prediction.selection + '_team')); // true if the predicted team was the favorite
    const predictedTeam = prediction.selection === "home" ? matchup.home_team : matchup.away_team;
    const opponentTeam = prediction.selection === "home" ? matchup.away_team : matchup.home_team;
    const predictedTeamSpreadValue = isSpreadFavorite ? `-${prediction.spread_points}` : `+${prediction.spread_points}`;

    return {
        pickNumber: (index + 1).toString(),
        predictedTeam: predictedTeam,
        predictedTeamSpreadValue: predictedTeamSpreadValue,
        opponentTeam: opponentTeam,
        oddsMakerName: matchup.bookmaker,
        oddsMadeOnDate: matchup.spread_date,
        kickoffDate: matchup.game_date,
        gameStatus: matchup.status,
        isCorrect: isCorrect,
    };
}
