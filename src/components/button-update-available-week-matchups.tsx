'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateNcaaMatchupsByWeek } from '@/actions/getOddsApi';


interface ButtonUpdateAvailableWeekMatchupsProps {
  week: number;
}

export default function ButtonUpdateAvailableWeekMatchups({ week }: ButtonUpdateAvailableWeekMatchupsProps) {

  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        await updateNcaaMatchupsByWeek(week);
        toast.success('Available Matchupts updated successfully!');
      } catch (error) {
        console.error('Error updating matchups:', error);
        toast.error('Failed to update matchups.');
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleUpdate}
      disabled={isPending}
    >
      {isPending ? 'Updating...' : 'Update Available Matchups'}
    </Button>
  );
}