import { PlayerClientType } from "@/models/Player";
import { Roles } from "./enums";
import { SpreadPickClientType } from "@/models/SpreadPick";
import { MatchupClientType } from "@/models/Matchup";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}

export interface Hometown {
  city: string;
  region: string;
}

export { Roles };

export type HandlerOptions = {
  isRoleProtected?: boolean;
  role?: Roles;
};

export const PlayerPickTableHeads = [
    "#",
    "Picked Team",
    "Spread for Picked Team",
    "Opponent Team",
    "Odds Maker",
    "Odds Date",
    "Kickoff Date",
];

export interface PredictionRowData {
    pickNumber: string;
    predictedTeam: string;
    predictedTeamSpreadValue: string;
    opponentTeam: string;
    oddsMakerName: string;
    oddsMadeOnDate: string;
    kickoffDate: string;
    gameStatus: string;
    isCorrect: boolean;
}

export interface PlayerPickTable {
    player: PlayerClientType;
    spreadPick: SpreadPickClientType;
    matchups: MatchupClientType[];
    tableTitle: string;
    tableHeads: string[];
    tableRowData: PredictionRowData[];
}

export interface PickTableProps {
    spreadPick: SpreadPickClientType;
    matchups: MatchupClientType[];
}
