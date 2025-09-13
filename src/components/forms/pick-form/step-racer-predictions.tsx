'use client';

import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RacerDriverClientType } from '@/models/reference/Racer';
import { GameClientType } from '@/models/reference/Game';
import { RaceClientType } from '@/models/reference/Race';
import { PickClientType, DriverPredictionClientType } from '@/models/reference/Pick';
import RacerPredictionSelectionDiv, { RacerPredictionDisplayProps } from './RacerPredictionSelectionDiv';
import { Separator } from '@/components/ui/separator';

export function convertNumberToStNdRdTh(num: number): string {
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod10 === 1 && mod100 !== 11) return '1st';
  if (mod10 === 2 && mod100 !== 12) return '2nd';
  if (mod10 === 3 && mod100 !== 13) return '3rd';
  return `${num}th`;
}

export function getRaceNameWithRaceId(raceId: string, races: RaceClientType[]): string {
  const race = races.find((race: RaceClientType) => race._id === raceId);
  return race ? `${race.letter} ${race.type}` : `Debug: Matching race not found for raceId: ${raceId}`;
}

export default function StepRacerPredictions({

  type,
  game,
  racerDrivers,
  races,
  pickForm,
  setPickForm,
}: {

  type: string;
  game: GameClientType;
  racerDrivers: RacerDriverClientType[];
  races: RaceClientType[];
  pickForm: PickClientType;
  setPickForm: React.Dispatch<React.SetStateAction<PickClientType>>;
}) {
  let cardTitle = '';
  let cardDescription = '';
  let predictions: RacerPredictionDisplayProps[] = [];

  if (type === 'hardcharger') {
    cardTitle = 'Hard Chargers';
    cardDescription = 'Pick who you think will pass the most cars!';
    predictions = Array.from({ length: game.num_hard_chargers }, (_, i) => ({
      name: `Hard Charger ${i + 1}`,
      avatar: `/avatars/${i + 1}.png`,
      role: 'Select Driver', //`Select Hard Charger ${i + 1}`,
      letter: 'H',
      number: i + 1,
    } as RacerPredictionDisplayProps));
  } else if (type === 'topfinisher') {
    cardTitle = 'Top Finishers';
    cardDescription = `Pick who you think will finish in the top ${game.num_top_finishers}!`;
    predictions = Array.from({ length: game.num_top_finishers }, (_, i) => ({
      name: `Top Finisher - ${convertNumberToStNdRdTh(i + 1)} Place`,
      avatar: `/avatars/${i + 1}.png`,
      role: 'Select Driver',//`Select Top Finisher ${i + 1}`,
      letter: 'T',
      number: i + 1,
    } as RacerPredictionDisplayProps));
  }

  // Get the list of already selected racer IDs for the current type
  const selectedRacerIds = pickForm[type === 'hardcharger' ? 'hard_chargers' : 'top_finishers'].map(
    (rp: DriverPredictionClientType) => rp.driver_id
  );

  // Filter racerDrivers to exclude "Transfer" drivers and already selected racers
  const filteredRacerDrivers = racerDrivers.filter(
    (racerDriver) =>
      !racerDriver.driver.first_name.toLowerCase().startsWith('transfer') &&
      !selectedRacerIds.includes(racerDriver.racer._id as string)
  );

  return (
    <Card className='w-full h-full overflow-y-auto'>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {predictions?.map((prediction: RacerPredictionDisplayProps, predictionIndex) => (
            <div key={predictionIndex} className="space-y-6">
            <RacerPredictionSelectionDiv
              key={predictionIndex}
              racerPredictionDisplayProps={prediction}
              type={type}
              racerDrivers={filteredRacerDrivers}
              races={races}
              pickForm={pickForm}
              setPickForm={setPickForm}
              index={predictionIndex} // Pass the index to identify the prediction slot
            />
            {predictionIndex < predictions.length - 1 && (
              <Separator className="" />
            )}
            </div>
        ))}
      </CardContent>

    </Card>
  );
}