'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ServerActionButtonProps {
    label: string;
    serverAction: (...args: unknown[]) => Promise<unknown>;
}

export default function ServerActionButton({ label, serverAction }: ServerActionButtonProps) {

    const [isPending, startTransition] = useTransition();

    const handleUpdate = () => {
        startTransition(async () => {
            try {
                // upon completion of server action execution,show toast
                await serverAction();
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
            {isPending ? 'Updating...' : label}
        </Button>
    );
}