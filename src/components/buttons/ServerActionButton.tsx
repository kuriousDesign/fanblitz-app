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
                toast.success(`${label} completed successfully!`);
            } catch (error) {
                console.error('Error executing server action:', error);
                toast.error('Failed to complete action. Please try again.');
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