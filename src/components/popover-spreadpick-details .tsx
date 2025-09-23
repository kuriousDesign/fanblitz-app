//import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import {
    Drawer,
    //DrawerClose,
    DrawerContent,
    //DrawerDescription,
    //DrawerFooter,
    DrawerHeader,
    DrawerTitle,
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

        { label: "Pick", className: "text-left" },
        { label: "Predicted", className: "text-center font-bold" },
        { label: "Points", className: "text-center" }
    ];


    const selectionDisplayNames: { [key: string]: string } = {};
    spreadPick.matchup_spread_predictions.forEach((prediction, index) => {
        const matchup = matchups.find((m: MatchupClientType) => m._id === prediction.matchup_id);
        if (matchup) {
            selectionDisplayNames[index] = prediction.selection === "home" ? matchup.home_team : matchup.away_team;
        }
    });


    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className='max-h-[80vh] overflow-y-auto'>
                <DrawerHeader>
                    <DrawerTitle>Predictions</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
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
                                <TableBody>
                                    {spreadPick.matchup_spread_predictions.map((prediction: MatchupSpreadPredictionClientType, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center text-primary font-bold">{selectionDisplayNames[index]}</TableCell>
                                            <TableCell className="text-center">{prediction.score}</TableCell>
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
