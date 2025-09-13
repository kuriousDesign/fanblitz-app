'use server';

import { getDriver, getRacersByRaceId, getRacesByGameId, getGame, getPicksByGameId } from "@/actions/getActions";
import { GameClientType } from "@/models/reference/Game";
import { PickClientType } from "@/models/reference/Pick";
import { RaceClientType } from "@/models/reference/Race";
import { RacerClientType } from "@/models/reference/Racer";

import { DriverClientType } from "@/models/reference/Driver";
import { getDriverFullName } from "@/types/helpers";
import { postGame, postHardChargerTable, postPick } from "@/actions/postActions";
import { GameStates } from "@/types/enums";
import { HardChargerEntryClientType, HardChargerTableClientType } from "@/models/reference/HardChargerTable";
import { getLinks } from "@/lib/link-urls";
import { revalidatePath } from "next/cache";

// Convert letter to ASCII index
function convertLetterToAscii(letter: string): number {
    if (letter.length !== 1 || !/^[A-Z]$/.test(letter)) {
        throw new Error("Invalid letter. Please provide a single uppercase letter A-Z.");
    }
    return letter.charCodeAt(0) - 'A'.charCodeAt(0);
}

// Calculate hard chargers leaderboard
export async function calculateHardChargersLeaderboardByGameId(gameId: string) {
    //console.log('1. Collect game and races');
    const game = await getGame(gameId) as GameClientType;
    const races = await getRacesByGameId(game._id as string) as RaceClientType[];

    // Sort races by letter (A first, then B, etc.)
    races.sort((a, b) => {
        const aLetter = a.letter ? convertLetterToAscii(a.letter) : 0;
        const bLetter = b.letter ? convertLetterToAscii(b.letter) : 0;
        return aLetter - bLetter;
    });

    // Build ordered race IDs with letters
    const orderedRaceIds = races.map((race) => ({
        id: race._id as string,
        letter: race.letter,
    }));
    //console.log('Ordered race IDs:', orderedRaceIds);

    // Collect all racers and drivers
    //console.log('2. Collect racers and drivers');
    const racers: RacerClientType[] = [];
    let raceAmainRacers: RacerClientType[] = [];
    const driverMap = new Map<string, DriverClientType>(); // Map to store unique drivers by _id

    // Fetch racers for each race
    for (const race of races) {
        const raceRacers = await getRacersByRaceId(race._id as string);
        racers.push(...raceRacers);
        if (race.letter === 'A') {
            raceAmainRacers = raceRacers;
            raceAmainRacers.sort((a, b) => a.current_position - b.current_position);
        }

        // Fetch drivers for each racer
        for (const racer of raceRacers) {
            if (!driverMap.has(racer.driver_id)) {
                const driver = await getDriver(racer.driver_id as string);
                driverMap.set(racer.driver_id, driver);
            }
        }
    }
    const uniqueDrivers = Array.from(driverMap.values());
    //console.log('Unique drivers:', uniqueDrivers.map(d => ({ _id: d._id, name: getDriverFullName(d) })));

    // Calculate hard charger table
    //console.log('3. Calculate hard charger table');
    const entries: HardChargerEntryClientType[] = [];
    uniqueDrivers.forEach((driver) => {
        const driverRacers = racers.filter((racer) => racer.driver_id === driver._id);
        const carsPassedByRace: number[] = [];
        let totalCarsPassed = 0;

        // Calculate cars passed for each race
        orderedRaceIds.forEach((raceIdObj) => {
            const racer = driverRacers.find((racer) => racer.race_id === raceIdObj.id);
            const carsPassed = racer ? racer.starting_position - racer.current_position : 999;
            totalCarsPassed += carsPassed === 999 ? 0 : carsPassed; // If carsPassed is 999, set to 0
            carsPassedByRace.push(carsPassed);
        });

        const hardChargerEntry: HardChargerEntryClientType = {
            driver_id: driver._id as string,
            driver_name: getDriverFullName(driver),
            total_cars_passed: totalCarsPassed,
            cars_passed_by_race: carsPassedByRace,
            rank: 0,
        };
        entries.push(hardChargerEntry);
    });

    // Calculate pick ranks
    entries.sort((a, b) => b.total_cars_passed - a.total_cars_passed);
    entries.forEach((entry, index) => {
        if (index === 0) {
            entry.rank = 1;
        } else if (entry.total_cars_passed === entries[index - 1].total_cars_passed) {
            entry.rank = entries[index - 1].rank;
        } else {
            entry.rank = index + 1;
        }
    });

    // Check if all races are finished
    const allFinished = races.every((race) => race.status === 'finished');
    if (allFinished) {
        game.status = GameStates.FINISHED;
        //console.log('All races finished, setting game status to FINISHED');
    } else {
        //console.log('Not all races finished, game status unchanged');
    }
    await postGame(game);

    // Create hard charger table
    const hardChargerTable: HardChargerTableClientType = {
        game_id: gameId,
        entries: entries,
    };

    //console.log('Hard charger table:', hardChargerTable);
    return { hardChargerTable, raceAmainRacers };
}

// Calculate hard charger scores for picks
export async function calculateHardChargerScoreForPicks(picks: PickClientType[], hardChargerTable: HardChargerTableClientType, game: GameClientType): Promise<void> {
    for (const pick of picks) {
        let totalScore = 0;
        for (const hardCharger of pick.hard_chargers) {
            const hardChargerEntry = hardChargerTable.entries.find((entry) => entry.driver_id === hardCharger.driver_id);
            if (hardChargerEntry) {
                const score = await calculateHardChargerScoreForDriver(hardChargerEntry.total_cars_passed, hardCharger.prediction, game);
                hardCharger.score = score;
                totalScore += score;
            }
        }
        pick.score_hard_chargers = totalScore;
    }
}

// Calculate hard charger score for a driver
export async function calculateHardChargerScoreForDriver(carsPassed: number, prediction: number, game: GameClientType): Promise<number> {
    if (carsPassed > prediction) {
        return prediction;
    } else if (carsPassed <= 0) {
        return carsPassed;
    } else if (carsPassed === prediction) {
        return prediction + game.hard_charger_prediction_bonus;
    } else {
        const diff = Math.abs(carsPassed - prediction);
        const penalty = prediction * game.hard_charger_prediction_scale * diff;
        return Math.max(0, carsPassed - penalty);
    }
}

export async function calculateTopFinishersScoreForDriverComplex(finishPosition: number, prediction: number, game: GameClientType): Promise<number> {
    const invertedPrediction = game.num_top_finishers - prediction + 1;
    const baselinePoints = invertedPrediction * game.top_finisher_prediction_penalty;
    const penaltyScale = invertedPrediction * game.top_finisher_prediction_penalty / game.num_top_finishers;
    const diffAbs = Math.abs(finishPosition - prediction);

    if (finishPosition === prediction) { // PERFECT PREDICTION - award bonus
        return baselinePoints + invertedPrediction  //game.top_finisher_prediction_bonus;
    } else if (finishPosition <= 0) {
        return 0;
    } else if (finishPosition > prediction) { // DRIVER FINISHED WORSE THAN PREDICTED - penalize
        const penalty = penaltyScale * diffAbs;
        return Math.max(0, baselinePoints - penalty);
    } else { // DRIVER FINISHED BETTER THAN PREDICTED - award partial bonus
        const outperformBonus = penaltyScale / 2.0 * diffAbs;
        return baselinePoints + outperformBonus;
    }
}
// Calculate top finishers score for a driver
export async function calculateTopFinishersScoreForDriver(finishPosition: number, prediction: number, game: GameClientType): Promise<number> {

    if (finishPosition === prediction) {
        return game.top_finisher_baseline_points + (game.num_top_finishers - prediction + 1)* 1.0; //game.top_finisher_prediction_penalty; //game.top_finisher_prediction_bonus;
    } else if (finishPosition <= 0) {
        return 0;
    } else if (finishPosition > prediction) { //penalize for worse finish than predicted
        const diff = Math.abs(finishPosition - prediction);
        const penalty = diff*1.0;// game.top_finisher_prediction_penalty * diff;
        return Math.max(0, game.top_finisher_baseline_points - penalty);
    } else { // award small bonus for outperforming prediction
        const diff = Math.abs(finishPosition - prediction);
        const outperformBonus = 0.5* diff; //game.top_finisher_prediction_penalty / 2.0 * diff;
        return game.top_finisher_baseline_points + outperformBonus;
    }
}


// Calculate top finishers scores for picks
export async function calculateTopFinishersScoreForPicks(picks: PickClientType[], raceAmainRacers: RacerClientType[], game: GameClientType): Promise<void> {
    for (const pick of picks) {
        let totalScore = 0;
        for (const topFinisher of pick.top_finishers) {
            const racer = raceAmainRacers.find((racer) => racer.driver_id === topFinisher.driver_id);
            if (racer) {
                const score = await calculateTopFinishersScoreForDriver(racer.current_position, topFinisher.prediction, game);
                topFinisher.score = score;
                totalScore += score;
            } else {
                console.warn(`Racer not found for driver_id: ${topFinisher.driver_id}`);
                topFinisher.score = 0; // Set score to 0 if racer not found
            }
        }
        pick.score_top_finishers = totalScore;
    }
}
// Update picks scores by game
export async function updatePicksScoresByGame(gameId: string, skipRevalidate?: boolean) {
    console.log(`Updating scores for picks in game: ${gameId}`);
    try {
        // 1. fetch game and picks for that game
        const game = await getGame(gameId) as GameClientType;
        const picks = await getPicksByGameId(gameId) as PickClientType[];
        if (!picks || picks.length === 0) {
            console.log("No picks found for the game");
            return;
            //return picks;
        }

        // 2. calculate hard chargers leaderboard and store it in the database
        const { hardChargerTable, raceAmainRacers } = await calculateHardChargersLeaderboardByGameId(gameId);
        postHardChargerTable(hardChargerTable);

        // 3. calculate scores for picks, starting with hard chargers then top finishers
        await calculateHardChargerScoreForPicks(picks, hardChargerTable, game); //this will modify picks passed in by reference
        await calculateTopFinishersScoreForPicks(picks, raceAmainRacers, game); // this will modify picks passed in by reference

        // 4. update score totals for picks and update the pick status
        picks.map((pick: PickClientType) => {
            pick.score_total = pick.score_top_finishers + pick.score_hard_chargers;
            pick.status = 'score_updated';
        });

        picks.sort((a, b) => b.score_total - a.score_total);
        // 5. calculate ranks for picks, equal scores get same rank
        picks.forEach((pick: PickClientType, index: number) => {
            if (index === 0) {
                pick.rank = 1;
            } else if (pick.score_total === picks[index - 1].score_total) {
                pick.rank = picks[index - 1].rank;
            } else {
                pick.rank = index + 1;
            }
        });

        await Promise.all(picks.map((pick) => postPick(pick)));
        //refresh the current window
        if (!skipRevalidate) {
            revalidatePath(getLinks().getGameUrl(gameId));
        }

        //return picks;
    } catch (error) {
        console.error("Error calculating scores for picks:", error);
    }
}

export async function updateGamePot(gameId: string) {
    try {
        const game = await getGame(gameId);
        if (!game) {
            console.error(`Game with ID ${gameId} not found`);
            return;
        }

        // Calculate the total pot from all picks
        const picks = await getPicksByGameId(gameId);
        // calculate total purse as number of picks * entry fee * ( 1 - game.house_cut)
        const totalPurse = picks.length * game.entry_fee * (1 - game.house_cut);

        // Update the game pot
        game.purse_amount = totalPurse;
        game.num_picks = picks.length;
        await postGame(game);

        console.log(`Updated pot for game ${gameId}: $${totalPurse}`);
    } catch (error) {
        console.error("Error updating game pot:", error);
    }
}