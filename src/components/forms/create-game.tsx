'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { GameClientType } from '@/models/reference/Game';
import { RaceClientType } from '@/models/reference/Race';
import { getRacesByEventId } from '@/actions/getActions';
import { postGame } from '@/actions/postActions';
import { getLinks } from '@/lib/link-urls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
interface CreateGameFormProps {
  eventId: string;
}

interface GameFormData extends Omit<GameClientType, 'races'> {
  races: string[]; // Array of race IDs
}

export default function CreateGameForm({ eventId }: CreateGameFormProps) {
  const router = useRouter();
  const [races, setRaces] = useState<RaceClientType[]>([]);
  const [selectedRaceIds, setSelectedRaceIds] = useState<string[]>([]);

  // Initialize form with React Hook Form
  const form = useForm<GameFormData>({
    defaultValues: {
      _id: '',
      event_id: eventId,
      name: '',
      type: 'hybrid', // Default to hybrid for balanced UX
      status: 'created',
      entry_fee: 10,
      house_cut: 0,
      purse_amount: 0,
      num_picks: 0,
      num_hard_chargers: 3,
      num_hard_chargers_predictions: 3,
      hard_charger_prediction_scale: 0.1,
      hard_charger_prediction_bonus: 2,
      num_top_finishers: 3,
      num_top_finishers_predictions: 3,
      top_finisher_baseline_points: 10,
      top_finisher_prediction_penalty: 2.0,
      top_finisher_prediction_bonus: 2.0,
      is_private: false,
      password: '',
      races: [],
      tie_breaker: {},
    },
  });

  // Fetch races on mount
  useEffect(() => {
    async function fetchRaces() {
      try {
        const fetched = await getRacesByEventId(eventId);
        setRaces(fetched);
      } catch (error) {
        console.error('Error fetching races:', error);
      }
    }
    fetchRaces();
  }, [eventId]);

  // Handle race selection
  const handleRaceSelect = (raceId: string) => {
    setSelectedRaceIds((prev) =>
      prev.includes(raceId)
        ? prev.filter((id) => id !== raceId)
        : [...prev, raceId]
    );
  };

  // Handle form submission
  const onSubmit = async (data: GameFormData) => {
    try {
      data.num_hard_chargers_predictions = data.num_hard_chargers;
      data.num_top_finishers_predictions = data.num_top_finishers;
      const gameData: GameClientType = {
        ...data,
        races: selectedRaceIds,
        tie_breaker: data.tie_breaker ?? {},
      };

      await postGame(gameData);
      console.log('Game created successfully:', gameData);
      router.push(getLinks().getEventUrl(eventId));
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  // Determine which fields to show based on game type
  const gameType = form.watch('type');
  const showHardChargerFields = gameType === 'hard_charger' || gameType === 'hybrid';
  const showTopFinisherFields = gameType === 'hybrid' || gameType === 'top_finisher' || gameType === 'classic_draw';

  return (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Game name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of Game</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Klootwyk Hard Charger Challenge"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              rules={{ required: 'Game type is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hard_charger">Hard Charger</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="top_finisher">Top Finisher</SelectItem>
                        <SelectItem value="classic_draw">Classic Draw</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose the game type to define prediction options
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Select Races to Include (at least one required)</FormLabel>
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto border p-2 rounded-md">
                {races.map((race) => (
                  <div key={race._id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRaceIds.includes(race._id as string)}
                      onCheckedChange={() => handleRaceSelect(race._id as string)}
                    />
                    <Label>
                      {race.type} {race.letter} ({race.laps} laps)
                    </Label>
                  </div>
                ))}
              </div>
              {selectedRaceIds.length === 0 && (
                <FormMessage className="text-red-500 text-sm mt-1">
                  Please select at least one race
                </FormMessage>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="entry_fee"
              rules={{
                required: 'Entry fee is required',
                min: { value: 0, message: 'Minimum is 0' },
                max: { value: 1000, message: 'Maximum is 1000' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Fee</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="house_cut"
              rules={{
                required: 'House cut is required',
                min: { value: 0, message: 'Minimum is 0%' },
                max: { value: 20, message: 'Maximum is 20%' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Cut (0-20%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purse_amount"
              rules={{
                required: 'Purse amount is required',
                min: { value: 0, message: 'Minimum is 0' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purse Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showHardChargerFields && (
              <>
                <FormField
                  control={form.control}
                  name="num_hard_chargers"
                  rules={{
                    required: 'Number of hard chargers is required',
                    min: { value: 1, message: 'Minimum is 1' },
                    max: { value: 24, message: 'Maximum is 24' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Hard Chargers</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="3"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              

                <FormField
                  control={form.control}
                  name="hard_charger_prediction_scale"
                  rules={{
                    required: 'Prediction scale is required',
                    min: { value: 0, message: 'Minimum is 0' },
                    max: { value: 10, message: 'Maximum is 10' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hard Charger Prediction Scale (points per car)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.1"
                          step="0.01"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hard_charger_prediction_bonus"
                  rules={{
                    required: 'Prediction bonus is required',
                    min: { value: 0, message: 'Minimum is 0' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hard Charger Prediction Bonus</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {showTopFinisherFields && (
              <>
                <FormField
                  control={form.control}
                  name="num_top_finishers"
                  rules={{
                    required: 'Number of top finishers is required',
                    min: { value: 1, message: 'Minimum is 1' },
                    max: { value: 24, message: 'Maximum is 24' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Top Finishers</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="3"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              

                <FormField
                  control={form.control}
                  name="top_finisher_baseline_points"
                  rules={{
                    required: 'Baseline points are required',
                    min: { value: 0, message: 'Minimum is 0' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Finisher Baseline Points</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="10"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="top_finisher_prediction_penalty"
                  rules={{
                    required: 'Prediction penalty is required',
                    min: { value: 0, message: 'Minimum is 0' },
                    max: { value: 10, message: 'Maximum is 10' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Finisher Prediction Penalty (points per car)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="2.0"
                          step="0.25"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="top_finisher_prediction_bonus"
                  rules={{
                    required: 'Prediction bonus is required',
                    min: { value: 0, message: 'Minimum is 0' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Top Finisher Prediction Bonus</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="is_private"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Private Game</FormLabel>
                  <FormDescription>
                    If checked, only users with the password can join
                  </FormDescription>
                </FormItem>
              )}
            />

            {form.watch('is_private') && (
              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required for private games' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter password for private game"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || selectedRaceIds.length === 0}
              className="w-full"
            >
              {form.formState.isSubmitting ? 'Creating...' : 'Create Game'}
            </Button>
          </form>
        </Form>

  );
}