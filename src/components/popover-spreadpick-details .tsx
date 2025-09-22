
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100vw]">
                <div className="space-y-8">

                    <div className="bg-accent/10">
                        <div className="font-semibold text-lg text-center">
                            Predictions
                        </div>

                        <div className="space-y-2">
                            {/* Insert top driver table here */}

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
            </PopoverContent>
        </Popover>
    );
}