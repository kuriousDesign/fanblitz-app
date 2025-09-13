'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RacerDriverClientType } from '@/models/reference/Racer';
import { RaceClientType } from '@/models/reference/Race';
import { PickClientType, DriverPredictionClientType } from '@/models/reference/Pick';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getDriverFullName } from '@/types/helpers';
import { CardPrediction } from './prediction';
import { numberToOrdinal } from '@/utils/helpers';

export interface RacerPredictionDisplayProps {
  name: string;
  avatar: string;
  role: string;
  letter: string;
  number: number;
}



export function getRaceNameWithRaceId(raceId: string, races: RaceClientType[]): string {
  const race = races.find((race: RaceClientType) => race._id === raceId);
  return race ? `${race.letter} ${race.type}` : `Debug: Matching race not found for raceId: ${raceId}`;
}

export default function RacerPredictionSelectionDiv({
  racerPredictionDisplayProps,
  type,
  racerDrivers,
  races,
  pickForm,
  setPickForm,
  index,
}: {
  racerPredictionDisplayProps: RacerPredictionDisplayProps;
  type: string;
  racerDrivers: RacerDriverClientType[];
  races: RaceClientType[];
  pickForm: PickClientType;
  setPickForm: React.Dispatch<React.SetStateAction<PickClientType>>;
  index: number; // New prop to identify the prediction slot
}) {
  const [open, setOpen] = useState(false);
  const [racerDr, setRacerDr] = useState<RacerDriverClientType | undefined>();
  const defaultGuess = 7;
  const [guess, setGuess] = useState(defaultGuess);

  const racerMaxCars = 24;
  const racerMinCars = 3;
  let userHint = '';
  let update_key: keyof PickClientType = 'hard_chargers';
  if (type === 'hardcharger') {
    update_key = 'hard_chargers';
    userHint = '';
  } else if (type === 'topfinisher') {
    update_key = 'top_finishers';
    userHint = ''; //`Who you think will finish in ${convertNumberToStNdRdTh(racerPredictionDisplayProps.number)}`;
    //console.log('Updating top finishers');
  } else {
    console.error('Invalid type provided for predictions:', type);
    //return null;
  }

  // Initialize racerDr and guess based on existing prediction at index
  useEffect(() => {
    const predictions = pickForm[update_key] as DriverPredictionClientType[];
    const prediction = predictions[index];
    if (prediction && prediction.driver_id) {
      if (type === 'hardcharger') {
        setGuess(prediction.prediction || defaultGuess);
      }
    }
  }, [pickForm, update_key, index, racerDrivers, type]);

  const handleRacerChange = (newRacerDriver: RacerDriverClientType) => {
    const driverId = newRacerDriver.driver._id as string;
    setPickForm((prevPickForm) => {
      const predictions = [...(prevPickForm[update_key] as DriverPredictionClientType[])];
      // Ensure the array is long enough to hold the index
      while (predictions.length <= index) {
        predictions.push({ driver_id: '', prediction: 0, score: 0 });
      }
      // Update or set the prediction at the specified index
      predictions[index] = {
        driver_id: driverId,
        prediction: type === 'hardcharger' ? guess : index + 1, // For hard chargers, use the guess; for top finishers, use index + 1
        score: predictions[index]?.score || 0,
      };
      return {
        ...prevPickForm,
        [update_key]: predictions,
      };
    });
    setRacerDr(newRacerDriver);
    setOpen(false);
  };

  function onPredictionClick(adjustment: number) {
    if (!racerDr) return; // Prevent updates if no driver is selected

    const newGuess = Math.max(racerMinCars, Math.min(racerMaxCars, guess + adjustment));
    setGuess(newGuess);

    setPickForm((prevPickForm) => {
      const predictions = [...(prevPickForm[update_key] as DriverPredictionClientType[])];
      // Ensure the array is long enough
      while (predictions.length <= index) {
        predictions.push({ driver_id: '', prediction: 0, score: 0 });
      }
      // Update prediction at the specified index
      if (predictions[index]?.driver_id) {
        predictions[index] = {
          ...predictions[index],
          prediction: newGuess,
        };
      }
      return {
        ...prevPickForm,
        [update_key]: predictions,
      };
    });
  }

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col justify-start items-start gap-4">
        <div className="flex flex-row justify-start items-center gap-4">
          <Avatar className="border">
            <AvatarFallback>
              {racerPredictionDisplayProps.name.charAt(0)}
              {racerPredictionDisplayProps.number}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm leading-none font-medium">{racerPredictionDisplayProps.name}</p>
            <p className="text-muted-foreground text-xs">{userHint}</p>
          </div>
        </div>
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                size="sm"
                className="ml-auto shadow-none"
                aria-expanded={open}
              >
                {racerDr ? getDriverFullName(racerDr.driver) : racerPredictionDisplayProps.role}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput placeholder="Search driver..." />
                <CommandList>
                  <CommandEmpty>No drivers found.</CommandEmpty>
                  <CommandGroup>
                    {racerDrivers.map((racerDriver: RacerDriverClientType) => (
                      <CommandItem
                        key={racerDriver.racer._id}
                        value={`${getDriverFullName(racerDriver.driver)} ${racerDriver.driver.car_number}`}
                        onSelect={() => handleRacerChange(racerDriver)}
                      >
                        <div className="flex flex-row items-center gap-2 w-full">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{getDriverFullName(racerDriver.driver)}</p>
                            <p className="text-muted-foreground text-xs">
                              Starting {numberToOrdinal(racerDriver.racer.starting_position)}{' '}
                              {getRaceNameWithRaceId(racerDriver.racer.race_id, races)}
                            </p>
                          </div>
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              racerDr?.racer._id === racerDriver.racer._id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {type === 'hardcharger' && racerDr && (
        <CardPrediction min={racerMinCars} max={racerMaxCars} guess={guess} onPredictionClick={onPredictionClick} />
      )}
    </div>
  );
}