'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateSpreadPicksScoresByGameWeek } from '@/actions/postScore';


interface ButtonUpdateGameProps {
  gameWeekId: string;
}

export default function ButtonUpdateGameWeekLeaderboard({ gameWeekId }: ButtonUpdateGameProps) {

  const [isPending, startTransition] = useTransition();

  const handleUpdateScores = () => {
    startTransition(async () => {
      try {
        await updateSpreadPicksScoresByGameWeek(gameWeekId);
        toast.success('Scores updated successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Error updating scores:', error);
        toast.error('Failed to update scores.');
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleUpdateScores}
      disabled={isPending}
    >
      {isPending ? 'Updating...' : 'Update Score'}
    </Button>
  );
}