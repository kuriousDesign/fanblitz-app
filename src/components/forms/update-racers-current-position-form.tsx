'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RacerClientType, RacerDriverClientType } from '@/models/reference/Racer';
import { RaceClientType } from '@/models/reference/Race';
import { postRacer } from '@/actions/postActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getGamesByEventId, getRacersWithDriversByRaceId } from '@/actions/getActions';
import { AlertCircle } from 'lucide-react';
import { GameClientType } from '@/models/reference/Game';
import { calculateHardChargersLeaderboardByGameId } from '@/actions/scoreActions';

// Props interface for the form
interface UpdateRacersCurrentPositionFormProps {
  race: RaceClientType;
  redirectUrl: string;
  restrictUnknownDropdowns?: boolean; // Feature flag
}

export default function UpdateRacersCurrentPositionForm({
  race,
  redirectUrl,
  restrictUnknownDropdowns = true,
}: UpdateRacersCurrentPositionFormProps) {
  const router = useRouter();
  const [racerDrivers, setRacerDrivers] = useState<RacerDriverClientType[]>([]);
  const [positions, setPositions] = useState<Array<{ racerId: string | null; position: number }>>(
    Array.from({ length: race.num_cars }, (_, i) => ({ racerId: null, position: i + 1 }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Fetch racers with drivers
  useEffect(() => {
    async function fetchData() {
      try {
        const racerDriversData = await getRacersWithDriversByRaceId(race._id as string);
        setRacerDrivers(racerDriversData);

        // Initialize positions based on current_position
        const initialPositions: Array<{ racerId: string | null; position: number }> = Array.from({ length: race.num_cars }, (_, i) => ({
          racerId: null,
          position: i + 1,
        }));
        racerDriversData.forEach((rd) => {
          if (rd.racer.current_position && rd.racer.current_position <= race.num_cars) {
            initialPositions[rd.racer.current_position - 1].racerId = rd.racer._id || null;
          }
        });
        setPositions(initialPositions);
      } catch (error) {
        console.error('Error fetching racer drivers:', error);
      }
    }
    fetchData();
  }, [race._id, race.num_cars]);

  // Get racers for a position
  const getAvailableRacers = (currentPosition: number, isUnknown: boolean) => {
    if (restrictUnknownDropdowns && isUnknown) {
      // Show only unassigned racers for "Unknown" dropdowns
      const assignedRacerIds = positions
        .filter((p) => p.position !== currentPosition && p.racerId)
        .map((p) => p.racerId) as string[];
      return [
        { racer: { _id: 'unknown', driver_id: '', current_position: null, race_id: '', starting_position: 0 }, driver: { _id: '', first_name: 'Unknown', last_name: '', car_number: '', suffix: '' } },
        ...racerDrivers.filter((rd) => !assignedRacerIds.includes(rd.racer._id as string)),
      ];
    }
    // Show all racers otherwise
    return [
      { racer: { _id: 'unknown', driver_id: '', current_position: null, race_id: '', starting_position: 0 }, driver: { _id: '', first_name: 'Unknown', last_name: '', car_number: '', suffix: '' } },
      ...racerDrivers,
    ];
  };

  // Handle racer selection
  const handleRacerChange = (position: number, racerId: string) => {
    setPositions((prev) => {
      const newPositions = [...prev];
      const newRacerId = racerId === 'unknown' ? null : racerId;

      // Clear the old position of the selected racer
      const oldPositionIndex = prev.findIndex(
        (p) => p.racerId === newRacerId && p.position !== position
      );
      if (oldPositionIndex !== -1) {
        newPositions[oldPositionIndex] = { ...newPositions[oldPositionIndex], racerId: null };
      }

      // Update the current position
      const currentIndex = position - 1;
      newPositions[currentIndex] = { ...newPositions[currentIndex], racerId: newRacerId };

      return newPositions;
    });
  };

  // Check for unknown racers
  const unknownPositions = positions
    .filter((p) => p.racerId === null)
    .map((p) => p.position);

  // Handle form submission
  const onSubmit = async () => {
    if (unknownPositions.length > 0) {
      setShowWarningDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const racerPromises = racerDrivers.map(async (rd) => {
        const newPosition = positions.find((p) => p.racerId === rd.racer._id)?.position || 0;
        if (rd.racer.current_position !== newPosition) {
          const racerData: RacerClientType = {
            ...rd.racer,
            current_position: newPosition,
          };
          await postRacer(racerData);
          console.log('Updated racer:', racerData);
        }
      });
      await Promise.all(racerPromises);
      // Recalculate the leaderboard after updating positions for all games that belong to event that race belongs to
      const games = await getGamesByEventId(race.event_id);
      // wait an additional 5sec to ensure all racer updates are processed
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log('Recalculating leaderboard for all games in event');
      games.forEach(async (game: GameClientType) => {
        const gameId = game._id;
        console.log('Calculating leaderboard for game:', gameId);
        await calculateHardChargersLeaderboardByGameId(gameId as string);
      }
      );
      router.refresh(); // Force revalidation of the cache
      console.log('routing back to url:', redirectUrl);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Error updating racer positions:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h2 className="text-xl font-bold">Update Race Standings for {race.letter} {race.type}</h2>
      <p className="text-sm text-muted-foreground">
        Adjust the current positions of racers after the race has started
        </p>

      {/* Dynamic Position Dropdowns */}
      {positions.map((pos) => {
        const position = pos.position;
        const selectedRacer = racerDrivers.find((rd) => rd.racer._id === pos.racerId);
        const isUnknown = pos.racerId === null;
        return (
          <div key={position} className="border p-4 rounded-md flex flex-col gap-2">
            <h3 className="text-md font-semibold">Position #{position}</h3>
            <div>
              <label className="text-sm font-medium">Select Racer</label>
              <Select
                value={pos.racerId || 'unknown'}
                onValueChange={(value) => handleRacerChange(position, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a racer" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRacers(position, isUnknown).map((rd) => (
                    <SelectItem key={rd.racer._id} value={rd.racer._id as string}>
                      {rd.racer._id !== 'unknown'
                        ? `${rd.driver.first_name} ${rd.driver.last_name} ${rd.driver?.suffix || ''} - Car #${rd.driver.car_number}`
                        : 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isUnknown && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Position #{position} is unassigned. Please select a racer.</AlertDescription>
              </Alert>
            )}
            {selectedRacer && pos.racerId !== 'unknown' && (
              <p className="text-sm text-muted-foreground">
                Starting: #{selectedRacer.racer.starting_position}
              </p>
            )}
          </div>
        );
      })}

      <Button onClick={onSubmit} disabled={isSubmitting || unknownPositions.length > 0} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Update Positions'}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(redirectUrl)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Racers</DialogTitle>
            <DialogDescription>
              The following positions are unassigned: {unknownPositions.join(', ')}. Please assign racers to all positions before submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWarningDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}