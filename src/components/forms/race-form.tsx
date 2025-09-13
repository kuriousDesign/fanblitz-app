'use client';

import { RaceClientType } from '@/models/reference/Race';
import { postRace } from '@/actions/postActions';
import { useRouter } from 'next/navigation';
import { getLinks } from '@/lib/link-urls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface RaceFormProps {
  eventId: string;
  redirectUrl?: string;
  initialData?: RaceClientType; // Optional initial data for edit mode
}

export default function RaceForm({ eventId, redirectUrl, initialData }: RaceFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?._id; // Determine if editing based on _id presence

  // Initialize form with React Hook Form
  const form = useForm<RaceClientType>({
    defaultValues: initialData
      ? {
          _id: initialData._id,
          letter: initialData.letter,
          type: initialData.type,
          laps: initialData.laps,
          num_cars: initialData.num_cars,
          event_id: initialData.event_id || eventId,
          status: initialData.status || 'lineup',
          num_transfers: initialData.num_transfers,
          first_transfer_position: initialData.first_transfer_position,
          intermission_lap: initialData.intermission_lap,
        }
      : {
          _id: '',
          letter: '',
          type: '',
          laps: 0,
          num_cars: 0,
          event_id: eventId,
          status: 'lineup',
          num_transfers: 0,
          first_transfer_position: 0,
          intermission_lap: 0,
        },
  });

  const handleSubmit = async (data: RaceClientType) => {
    try {
      if (isEditMode) {
        if (!data._id) throw new Error('Race ID is missing');
        await postRace(data);
        console.log('Updated race:', data);
      } else {
        await postRace(data);
        console.log('Created race:', data);
      }
      router.push(redirectUrl || getLinks().getRacesByEventUrl(eventId));
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} race:`, error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6 max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          {isEditMode ? 'Edit Race' : 'Create Race'}
        </h2>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Race Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main">Main</SelectItem>
                    <SelectItem value="Heat">Heat</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="letter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`${form.getValues('type') || 'Race'} Identifier`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., A, B, C or 1, 2, 3"
                  className="w-full"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="laps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Laps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                  min={1}
                  max={100}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="num_cars"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Cars</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                  min={1}
                  max={100}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="num_transfers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Transfers</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                  min={0}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_transfer_position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Transfer Position</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                  min={1}
                  max={form.getValues('num_cars') - form.getValues('num_transfers') + 1 || 1}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="intermission_lap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intermission Lap - leave as 0 if not applicable</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="use 0 if not applicable"
                  className="w-full"
                  min={0}
                  max={form.getValues('laps') || 100}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {form.formState.isSubmitting ? 'Submitting...' : isEditMode ? 'Update Race' : 'Create Race'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push(redirectUrl || getLinks().getRacesByEventUrl(eventId))}
        >
          Cancel
        </Button>
      </form>
    </Form>
  );
}