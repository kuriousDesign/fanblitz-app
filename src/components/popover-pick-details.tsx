
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GameClientType } from '@/models/reference/Game';
import { HardChargerTableClientType } from '@/models/reference/HardChargerTable';
import { DriverPredictionClientType, PickClientType } from '@/models/reference/Pick';
import { RacerClientType } from '@/models/reference/Racer';
import { DriverClientType } from '@/models/reference/Driver';

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
import { GameTypes } from '@/types/enums';
import { numberToOrdinal } from '@/utils/helpers';

interface PopoverPickDetailsProps {
    pick: PickClientType;
    game: GameClientType;
    hardChargerTable: HardChargerTableClientType; // Replace with proper type
    aMainRacers: RacerClientType[];
    aMainDrivers: DriverClientType[]; // Optional, if needed for top finishers
}

export function PopoverPickDetails({
    pick,
    game,
    hardChargerTable,
    aMainRacers,
    aMainDrivers,
}: PopoverPickDetailsProps) {


    // need to create table headers dependent on game type
    const tableHeads = [
   
  
        { label: "Driver", className: "text-left" },
        { label: "Predicted", className: "text-center font-bold" },
        { label: "Actual", className: "text-center" },
        { label: "Points", className: "text-center" }
    ];

    // create a function that finds hard charger driver name using driver_id as input
    const findHardChargerDriverName = (driverId: string): string => {
        // use hardChargerTable.entries to find driver name
        const entry = hardChargerTable.entries.find(entry => entry.driver_id === driverId);
        if (entry) {
            return entry.driver_name;
        }
        return "Unknown Driver";
    };

    const findHardChargerTotalCarsPassed = (driverId: string): number => {
        const entry = hardChargerTable.entries.find(entry => entry.driver_id === driverId);
        if (entry) {
            return entry.total_cars_passed;
        }
        return 0;
    };
   


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100vw]">
                <div className="space-y-8">
                    {(game.type === GameTypes.HYBRID || game.type === GameTypes.TOP_FINISHER) &&
                        <div className="bg-accent/10">
                            <div className="font-semibold text-lg text-center">
                                Top Finishers
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
                                        {pick.top_finishers.map((tf: DriverPredictionClientType, index: number) => (
                                            <TableRow key={index}>
                                          
                                                <TableCell className="text-left">
                                                    {(() => {
                                                        const driver = aMainDrivers?.find(driver => 
                                                            driver._id === (aMainRacers.find(racer => racer.driver_id === tf.driver_id)?.driver_id || 'N/A')
                                                        );
                                                        return driver ? `${driver.first_name} ${driver.last_name}` : 'N/A';
                                                    })()}
                                                </TableCell>
                                                <TableCell className="text-center">{numberToOrdinal(tf.prediction)}</TableCell>
                                                <TableCell className="text-center text-primary font-bold">{numberToOrdinal(aMainRacers.find(racer => racer.driver_id === tf.driver_id)?.current_position || -1)}</TableCell>
                                                <TableCell className="text-center">{tf.score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    }
                      {(game.type === GameTypes.HYBRID || game.type === GameTypes.HARD_CHARGER) &&
                        <div>
                            <div className="font-semibold text-lg text-center">
                                Hard Chargers
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
                                        {pick.hard_chargers.map((hc: DriverPredictionClientType, index: number) => (
                                            <TableRow key={index}>
                                          
                                                <TableCell className="text-left">{findHardChargerDriverName(hc.driver_id)}</TableCell>
                                                <TableCell className="text-center">{hc.prediction}</TableCell>
                                                <TableCell className="text-center text-primary font-bold">{findHardChargerTotalCarsPassed(hc.driver_id)}</TableCell>
                                                <TableCell className="text-center">{hc.score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    }
                </div>
            </PopoverContent>
        </Popover>
    );
}