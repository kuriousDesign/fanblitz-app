'use server';

import { GameWeekClientType } from "@/models/GameWeek";
import { MatchupSpreadPredictionClientType, SpreadPickClientType } from "@/models/SpreadPick";
import { getGameWeek, getMatchupsByGameWeek, getSpreadPicks } from "./getMatchups";
import { updateOddsApiNcaaMatchupsScoresByGameWeek } from "./getOddsApi";
import { MatchupClientType } from "@/models/Matchup";
import { postSpreadPick } from "./postPick";

export async function updateSpreadPicksScoresByGameWeek(gameWeekId: string, skipRevalidate?: boolean) {
    console.log(`Updating scores for picks in gameWeek: ${gameWeekId}`);
    try {
        // 1. fetch game week, spread picks and matchups for that game week
        const gameWeek = await getGameWeek(gameWeekId) as GameWeekClientType;
        // add filter for spread picks to only get picks for this game week
        if (!gameWeek) {
            console.log("No game week found");
            return;
        }
        const filter = { game_week_id: gameWeekId };
        const [spreadPicks, matchups] = await Promise.all([
            getSpreadPicks(filter) as Promise<SpreadPickClientType[]>,
            getMatchupsByGameWeek(gameWeekId)
        ]);
        if (!spreadPicks || spreadPicks.length === 0) {
            console.log("No picks found for the game");
            return;
        }

        // 2. update matchup scores for that week just in case something changed
        await updateOddsApiNcaaMatchupsScoresByGameWeek(gameWeekId);

        // 3. calculate scores for all the picks
        await calculateScoreForSpreadPicks(spreadPicks, matchups); //this will modify picks passed in by reference

        // 4. sort picks by score descending
        spreadPicks.sort((a, b) => b.score_total - a.score_total);
        // 5. calculate ranks for picks, equal scores get same rank
        spreadPicks.forEach((pick: SpreadPickClientType, index: number) => {
            if (index === 0) {
                pick.rank = 1;
            } else if (pick.score_total === spreadPicks[index - 1].score_total) {
                pick.rank = spreadPicks[index - 1].rank;
            } else {
                pick.rank = index + 1;
            }
        });

        await Promise.all(spreadPicks.map((pick) => postSpreadPick(pick)));
        //refresh the current window
        if (!skipRevalidate) {
           // revalidatePath(getLinks().getGameUrl(gameWeekId));
        }

        //return picks;
    } catch (error) {
        console.error("Error calculating scores for picks:", error);
    }
}


// Calculate scores for picks
export async function calculateScoreForSpreadPicks(spreadPicks: SpreadPickClientType[], matchups: MatchupClientType[]): Promise<void> {
    for (const pick of spreadPicks) {
        pick.score_total = 0;
        await Promise.all(pick.matchup_spread_predictions.map(async (prediction: MatchupSpreadPredictionClientType) => {
            const matchup = prediction.matchup_id ? matchups.find(m => m._id === prediction.matchup_id) : null;

            if (matchup) {
                prediction.score = await calculateScoreForPrediction(prediction, matchup);
                pick.score_total += prediction.score;
            }
        }));
        pick.status = 'score_updated';
        //console.log(`Pick ${pick._id} total score: ${pick.score_total}`); // Log the total score for each pick

    }
}


// Calculate hard charger score for a driver
export async function calculateScoreForPrediction(prediction: MatchupSpreadPredictionClientType, matchup: MatchupClientType): Promise<number> {
    const wasCorrect = (prediction.selection + '_team') === matchup.winner;
    
    if (wasCorrect) {
        //console.log('Prediction was correct', prediction.selection, matchup.winner);
        return 1.0;
    } else {
        //console.log('Prediction was incorrect', prediction.selection, matchup.winner);
        return 0;
    }
}