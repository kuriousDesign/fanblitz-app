'use client';

import { useState } from 'react';
import { DriverClientType } from '@/models/reference/Driver';
import { RaceClientType } from '@/models/reference/Race';
import { RacerClientType } from '@/models/reference/Racer';
import CreateRacersRaceStartingLineupForm from '@/components/forms/create-racers-race-starting-lineup';
import DriverForm from '@/components/forms/driver-form';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';


interface RaceLineupPageProps {
  race: RaceClientType;
  drivers: DriverClientType[];
  existingRacers?: RacerClientType[];
  redirectUrl: string;
}

export default function RaceLineupPage({
  race,
  drivers: initialDrivers,
  existingRacers,
  redirectUrl,
}: RaceLineupPageProps) {
  const [drivers, setDrivers] = useState<DriverClientType[]>(initialDrivers);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDriverCreated = (newDriver: DriverClientType) => {
    setDrivers((prev) => [...prev, newDriver].sort((a, b) =>
      a.last_name.localeCompare(b.last_name, 'en', { sensitivity: 'base' })
    ));
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative min-h-screen p-4">
      <CreateRacersRaceStartingLineupForm
        race={race}
        drivers={drivers}
        existingRacers={existingRacers}
        redirectUrl={redirectUrl}
      />

      {/* Float Create Driver Btn */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-4 right-4 flex flex-col items-center justify-center">

          <Button
          variant='secondary'
            className="rounded-full size-20 shadow-xl flex flex-col items-center justify-center gap-1 "
            size="icon"
            onClick={() => setIsDrawerOpen(true)}
          >
            <div className='flex flex-col items-center justify-center text-secondary-foreground'>
           <div className='text-sm  h-5 '>Create</div>
          <div className='text-sm h-5'>Driver</div>
          </div>
            
          </Button>

          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Driver</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <DriverForm onSuccess={handleDriverCreated} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}