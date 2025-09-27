//import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
    Drawer,
    //DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    //DrawerDescription,
    //DrawerFooter,
    // DrawerHeader,
    // DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import { MatchupSpreadPredictionClientType, SpreadPickClientType } from '@/models/SpreadPick';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { MatchupClientType } from '@/models/Matchup';
import React from 'react';


interface PopoverPickDetailsProps {
    spreadPick: SpreadPickClientType;
    matchups: MatchupClientType[];
}

export function PopoverSpreadPickDetails({
    spreadPick,
    matchups,
}: PopoverPickDetailsProps) {

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
    spreadPick.matchup_spread_predictions.forEach((prediction, index) => {
        const matchup = matchups.find((m: MatchupClientType) => m._id === prediction.matchup_id);
        if (matchup) {
            //console.log("matchup status", matchup.status);
            predictionMatchups[index] = matchup;
            selectionDisplayNames[index] = prediction.selection === "home" ? matchup.home_team : matchup.away_team;
            isCorrect[index] = (prediction.selection + '_team') === matchup.winner;
            isSpreadFavorite[index] = (matchup.spread_favorite_team === (prediction.selection + '_team')); // true if the predicted team was the favorite
        }
    });

    // sort the matchup predictions by matchup status: in_progress, finished, scheduled
    
    // matchup status: scheduled, in_progress, finished

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className='overflow-y-auto'>
                <DrawerHeader>
                    <DrawerTitle className='hidden'>Predictions</DrawerTitle>
                </DrawerHeader>
                <div className="p-2">
                    <div className="bg-accent/10">
                        <div className="space-y-2 px-2">
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
                                        <TableRow key={index} className={`py-0 ${isCorrect[index] ? "text-primary" : "text-muted-foreground"}`}>
                                            <TableCell className="text-center py-0">{index + 1}</TableCell>
                                            <TableCell className="text-left font-bold py-0">{selectionDisplayNames[index]}</TableCell>
                                            <TableCell className="text-center py-0">{isSpreadFavorite[index] ? `-${prediction.spread_points}` : `+${prediction.spread_points}`}</TableCell>
                                            <TableCell className="text-center py-0">
                                                {predictionMatchups[index]?.status === 'finished'
                                                    ? (isCorrect[index] ? "🏆" : <span className="text-red-500 font-bold">L</span>)
                                                    : predictionMatchups[index]?.status === 'in_progress'
                                                        ? <span className="animate-pulse text-blue-500">live</span>
                                                        : "--"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
