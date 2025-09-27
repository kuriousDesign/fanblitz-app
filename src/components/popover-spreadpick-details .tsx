//import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
    Drawer,
    //DrawerClose,
    DrawerContent,
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
import { GameStates } from "@/types/enums";

interface PopoverPickDetailsProps {
    spreadPick: SpreadPickClientType;
    matchups: MatchupClientType[];
    gameStatus: GameStates;
}

export function PopoverSpreadPickDetails({
    spreadPick,
    matchups,
    gameStatus
}: PopoverPickDetailsProps) {


    // need to create table headers dependent on game type
    const tableHeads = [

        { label: "#", className: "text-left" },
        { label: "Picked", className: "text-center font-bold" },
    ];

    if (gameStatus === GameStates.FINISHED) {
        tableHeads.push({ label: "Correct?", className: "text-center" });
        //tableCellSpecial = 
    } else {
        tableHeads.push({ label: "Spread", className: "text-center" });
        //tableCellSpecial = <TableCell className="text-center">{prediction.spread}</TableCell>;
    }


    const selectionDisplayNames: { [key: string]: string } = {};
    const isCorrect: { [key: string]: boolean } = {};
    const isSpreadFavorite: { [key: string]: boolean } = {};
    spreadPick.matchup_spread_predictions.forEach((prediction, index) => {
        const matchup = matchups.find((m: MatchupClientType) => m._id === prediction.matchup_id);
        if (matchup) {
            selectionDisplayNames[index] = prediction.selection === "home" ? matchup.home_team : matchup.away_team;
            isCorrect[index] = (prediction.selection + '_team') === matchup.winner;
            isSpreadFavorite[index] = (matchup.spread_favorite_team === (prediction.selection + '_team')); // true if the predicted team was the favorite
        }
    });


    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className='overflow-y-auto'>
                {/* <DrawerHeader>
                    <DrawerTitle>Predictions</DrawerTitle>
                </DrawerHeader> */}
                <div className="p-2">
                    <div className="bg-accent/10">
                        <div className="space-y-2">
                            <Table>
                                <TableHeader className='bg-gray-300/10'>
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
                                            <TableCell className="text-center font-bold py-0">{selectionDisplayNames[index]}</TableCell>
                                            {gameStatus === GameStates.FINISHED ? (
                                                <TableCell className="text-center py-0">{isCorrect[index] ? "✔️" : "❌"}</TableCell>
                                            ) : (
                                                <TableCell className="text-center py-0">{isSpreadFavorite[index] ? `-${prediction.spread_points}` : `+${prediction.spread_points}`}</TableCell>
                                            )}
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
