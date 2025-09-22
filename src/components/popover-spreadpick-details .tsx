
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

interface PopoverPickDetailsProps {
    spreadPick: SpreadPickClientType;
}

export function PopoverSpreadPickDetails({
    spreadPick,
}: PopoverPickDetailsProps) {


    // need to create table headers dependent on game type
    const tableHeads = [

        // { label: "Winner", className: "text-left" },
        { label: "Predicted", className: "text-center font-bold" },
        { label: "Points", className: "text-center" }
    ];

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
                                            {/* <TableCell className="text-center">{numberToOrdinal(matchup.winner)}</TableCell> */}
                                            <TableCell className="text-center text-primary font-bold">{prediction.selection}</TableCell>
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