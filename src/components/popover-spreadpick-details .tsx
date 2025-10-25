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

import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import PickTable from "@/components/tables/pick-table";
import { PickTableProps } from "@/types/globals";


export function PopoverSpreadPickDetails({
    spreadPick,
    matchups,
}: PickTableProps) {
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
                            <PickTable spreadPick={spreadPick} matchups={matchups} />
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
