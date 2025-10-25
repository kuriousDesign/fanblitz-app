'use server';

// <PickTable spreadPick={spreadPickRef.current} matchups={matchups} />}
import {MatchupClientType} from "@/models/Matchup";

import { SpreadPickClientType } from "@/models/SpreadPick";
import { getGameWeek, getMatchupsByGameWeek, getSpreadPicks } from "./getMatchups";
import { getPlayer } from "./getActions";
import { buildPlayerPickTableRowData } from "@/utils/actionHelpers";
import { PlayerPickTable, PlayerPickTableHeads } from "@/types/globals";



export async function getPlayerPickTable(spreadPick: SpreadPickClientType, matchups: MatchupClientType[]): Promise<PlayerPickTable | null> {
    const player = await getPlayer(spreadPick.player_id);

    if (!player) {
        console.error("Player not found:", spreadPick.player_id);
        return null;
    }

    const playerPickTable : PlayerPickTable = {
        player,
        spreadPick,
        matchups,
        tableTitle: `Picks for ${player.name}`,
        tableHeads: PlayerPickTableHeads,
        tableRowData: []
    };

    // populate tableRowData
    spreadPick.matchup_spread_predictions.forEach((prediction, index) => {
        const matchup = matchups.find((m: MatchupClientType) => m._id === prediction.matchup_id);
        if (!matchup) {
            console.error("Matchup not found for prediction:", prediction.matchup_id);
            return;
        }
        playerPickTable.tableRowData.push(buildPlayerPickTableRowData(matchup, prediction, index));
    });

    return playerPickTable;
}

export async function getGameWeekPlayerPickTables(gameWeekId: string): Promise<PlayerPickTable[]> {
    const filter = { game_week_id: gameWeekId };
    const picksPromise = getSpreadPicks(filter);
    const matchupsPromise = getMatchupsByGameWeek(gameWeekId);

    const gameWeek = await getGameWeek(gameWeekId);
    if (!gameWeek) {
        console.error("Game Week not found");
        return [];
    }

    const [matchups, picks] = await Promise.all([
        //playerPromise,
        matchupsPromise,
        picksPromise,
    ]);
    const playerPickTables: PlayerPickTable[] = [];

    for (const pick of picks) {
        const playerPickTable = await getPlayerPickTable( pick, matchups);
        if (playerPickTable) {
            playerPickTables.push(playerPickTable);
        }
    }
    return playerPickTables;
}