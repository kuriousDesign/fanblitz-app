'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EventClientType } from '@/models/reference/Event';
import { postEvent } from '@/actions/postActions';
import { getLinks } from '@/lib/link-urls';

interface EventFormProps {
  onSuccess?: (event: EventClientType) => void;
  redirectUrl?: string;
  initialData?: EventClientType;
}

export default function FormEvent({ onSuccess, redirectUrl, initialData }: EventFormProps) {
  const router = useRouter();

  // Helper function to convert date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (date: string | Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventClientType>({
    defaultValues: {
      _id: initialData?._id || '',
      name: initialData?.name || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      location: initialData?.location || '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        _id: initialData._id || '',
        name: initialData.name || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        location: initialData.location || '',
      });
    }
  }, [initialData, reset]);

  // Handle form submission
  const onSubmit = async (data: EventClientType) => {
    try {
      const eventData: EventClientType = {
        ...data,
        _id: initialData?._id,
        date: data.date ? formatDateToDDMMYYYY(data.date) : '',
      };

      if (initialData?._id) {
        // Update existing event
        await postEvent(eventData);
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        await postEvent(eventData);
        toast.success('Event created successfully!');
      }

      reset();
      if (onSuccess) {
        onSuccess(eventData);
      }
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (!onSuccess) {
        router.push(getLinks().getEventsUrl());
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(initialData?._id ? 'Failed to update event.' : 'Failed to create event.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-2xl font-bold">{initialData?._id ? 'Edit Event' : 'Create Event'}</h2>

      <div>
        <input
          type="text"
          {...register('name', { required: 'Event name is required' })}
          placeholder="Event Name"
          className="border p-2 rounded w-full"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <input
          type="date"
          {...register('date', { required: 'Event date is required' })}
          className="border p-2 rounded w-full"
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>

      <div>
        <input
          type="text"
          {...register('location', { required: 'Location is required' })}
          placeholder="Location"
          className="border p-2 rounded w-full"
        />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {initialData?._id ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
}