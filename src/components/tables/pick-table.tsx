import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { MatchupSpreadPredictionClientType } from '@/models/SpreadPick';

import { MatchupClientType } from '@/models/Matchup';
import React from 'react';
import { PickTableProps } from "@/types/globals";


export default function PickTable({ spreadPick, matchups }: PickTableProps) {
        // need to create table headers dependent on game type
        const tableHeads = [
            { label: "#", className: "text-center" },
            { label: "Picked", className: "text-left" },
            { label: "Spread", className: "text-center" },
            { label: "Result", className: "text-center" },
        ];
    
        const selectionDisplayNames: { [key: string]: string } = {};
        const isCorrect: { [key: string]: boolean } = {};
        const isSpreadFavorite: { [key: string]: boolean } = {};
        const predictionMatchups: { [key: string]: MatchupClientType } = {};
        spreadPick.matchup_spread_predictions.forEach((prediction: MatchupSpreadPredictionClientType, index: number) => {
            const matchup = matchups.find((m: MatchupClientType) => m._id === prediction.matchup_id);
            if (matchup) {
                //console.log("matchup status", matchup.status);
                predictionMatchups[index] = matchup;
                selectionDisplayNames[index] = prediction.selection === "home" ? matchup.home_team : matchup.away_team;
                isCorrect[index] = (prediction.selection + '_team') === matchup.winner;
                isSpreadFavorite[index] = (matchup.spread_favorite_team === (prediction.selection + '_team')); // true if the predicted team was the favorite
            }
        });

    const getRowTextColor = (index: number) => {
        const matchup = predictionMatchups[index];
        if (!matchup) return "text-muted-foreground";
        
        switch (matchup.status) {
            case 'finished':
                return isCorrect[index] ? "text-primary" : "text-red-500";
            case 'in_progress':
                return "text-blue-500";
            default:
                return "text-muted-foreground";
        }
    };
    return (
        <Table>
            <TableHeader className='bg-gray-300/10 text-sm'>
                <TableRow>
                    {tableHeads.map((head, index) => (
                        <TableHead key={index} className={head.className}>
                            {head.label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody className='text-xs overflow-y-auto'>
                {spreadPick.matchup_spread_predictions.map((prediction: MatchupSpreadPredictionClientType, index: number) => (
                    <TableRow key={index} className={`py-0 ${getRowTextColor(index)}`}>
                        <TableCell className={`text-center py-0 `}>{index + 1}</TableCell>
                        <TableCell className="text-left font-bold py-0">{selectionDisplayNames[index]}</TableCell>
                        <TableCell className="text-center py-0">{isSpreadFavorite[index] ? `-${prediction.spread_points}` : `+${prediction.spread_points}`}</TableCell>
                        <TableCell className="text-center py-0">
                            {predictionMatchups[index]?.status === 'finished'
                                ? (isCorrect[index] ? <span className="text-primary font-bold">W</span> : <span className="text-red-500 ">L</span>)
                                : predictionMatchups[index]?.status === 'in_progress'
                                    ? <span className="animate-puls">live</span>
                                    : "--"
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}