'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DriverClientType } from '@/models/reference/Driver';
import { postDriver } from '@/actions/postActions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { formatHometown, parseHometown } from '@/types/helpers';
import { Hometown } from '@/types/globals';
import { toast } from 'sonner';
import { getLinks } from '@/lib/link-urls';

// List of regions with country abbreviations
const regions = [
  // US States
  { value: 'AL', label: 'Alabama', country: 'US' },
  { value: 'AK', label: 'Alaska', country: 'US' },
  { value: 'AZ', label: 'Arizona', country: 'US' },
  { value: 'AR', label: 'Arkansas', country: 'US' },
  { value: 'CA', label: 'California', country: 'US' },
  { value: 'CO', label: 'Colorado', country: 'US' },
  { value: 'CT', label: 'Connecticut', country: 'US' },
  { value: 'DE', label: 'Delaware', country: 'US' },
  { value: 'FL', label: 'Florida', country: 'US' },
  { value: 'GA', label: 'Georgia', country: 'US' },
  { value: 'HI', label: 'Hawaii', country: 'US' },
  { value: 'ID', label: 'Idaho', country: 'US' },
  { value: 'IL', label: 'Illinois', country: 'US' },
  { value: 'IN', label: 'Indiana', country: 'US' },
  { value: 'IA', label: 'Iowa', country: 'US' },
  { value: 'KS', label: 'Kansas', country: 'US' },
  { value: 'KY', label: 'Kentucky', country: 'US' },
  { value: 'LA', label: 'Louisiana', country: 'US' },
  { value: 'ME', label: 'Maine', country: 'US' },
  { value: 'MD', label: 'Maryland', country: 'US' },
  { value: 'MA', label: 'Massachusetts', country: 'US' },
  { value: 'MI', label: 'Michigan', country: 'US' },
  { value: 'MN', label: 'Minnesota', country: 'US' },
  { value: 'MS', label: 'Mississippi', country: 'US' },
  { value: 'MO', label: 'Missouri', country: 'US' },
  { value: 'MT', label: 'Montana', country: 'US' },
  { value: 'NE', label: 'Nebraska', country: 'US' },
  { value: 'NV', label: 'Nevada', country: 'US' },
  { value: 'NH', label: 'New Hampshire', country: 'US' },
  { value: 'NJ', label: 'New Jersey', country: 'US' },
  { value: 'NM', label: 'New Mexico', country: 'US' },
  { value: 'NY', label: 'New York', country: 'US' },
  { value: 'NC', label: 'North Carolina', country: 'US' },
  { value: 'ND', label: 'North Dakota', country: 'US' },
  { value: 'OH', label: 'Ohio', country: 'US' },
  { value: 'OK', label: 'Oklahoma', country: 'US' },
  { value: 'OR', label: 'Oregon', country: 'US' },
  { value: 'PA', label: 'Pennsylvania', country: 'US' },
  { value: 'RI', label: 'Rhode Island', country: 'US' },
  { value: 'SC', label: 'South Carolina', country: 'US' },
  { value: 'SD', label: 'South Dakota', country: 'US' },
  { value: 'TN', label: 'Tennessee', country: 'US' },
  { value: 'TX', label: 'Texas', country: 'US' },
  { value: 'UT', label: 'Utah', country: 'US' },
  { value: 'VT', label: 'Vermont', country: 'US' },
  { value: 'VA', label: 'Virginia', country: 'US' },
  { value: 'WA', label: 'Washington', country: 'US' },
  { value: 'WV', label: 'West Virginia', country: 'US' },
  { value: 'WI', label: 'Wisconsin', country: 'US' },
  { value: 'WY', label: 'Wyoming', country: 'US' },
  // Canadian Provinces
  { value: 'AB', label: 'CAN - Alberta', country: 'CAN' },
  { value: 'BC', label: 'CAN - British Columbia', country: 'CAN' },
  { value: 'MB', label: 'CAN - Manitoba', country: 'CAN' },
  { value: 'NB', label: 'CAN - New Brunswick', country: 'CAN' },
  { value: 'NL', label: 'CAN - Newfoundland and Labrador', country: 'CAN' },
  { value: 'NS', label: 'CAN - Nova Scotia', country: 'CAN' },
  { value: 'ON', label: 'CAN - Ontario', country: 'CAN' },
  { value: 'PE', label: 'CAN - Prince Edward Island', country: 'CAN' },
  { value: 'QC', label: 'CAN - Quebec', country: 'CAN' },
  { value: 'SK', label: 'CAN - Saskatchewan', country: 'CAN' },
  { value: 'NT', label: 'CAN - Northwest Territories', country: 'CAN' },
  { value: 'NU', label: 'CAN - Nunavut', country: 'CAN' },
  { value: 'YT', label: 'CAN - Yukon', country: 'CAN' },
  // Australian Territories
  { value: 'NSW', label: 'AUS - New South Wales', country: 'AUS' },
  { value: 'QLD', label: 'AUS - Queensland', country: 'AUS' },
  { value: 'SA', label: 'AUS - South Australia', country: 'AUS' },
  { value: 'TAS', label: 'AUS - Tasmania', country: 'AUS' },
  { value: 'VIC', label: 'AUS - Victoria', country: 'AUS' },
  { value: 'WA-AUS', label: 'AUS - Western Australia', country: 'AUS' },
  { value: 'ACT', label: 'AUS - Australian Capital Territory', country: 'AUS' },
  { value: 'NT-AU', label: 'AUS - Northern Territory', country: 'AUS' },
];

interface DriverFormProps {
  onSuccess?: (driver: DriverClientType) => void;
  redirectUrl?: string;
  initialData?: DriverClientType;
}

export default function DriverForm({ onSuccess, redirectUrl, initialData }: DriverFormProps) {
  const router = useRouter();
  const [hometown, setHometown] = useState<Hometown>({ city: '', region: '' });

  // Initialize form
  const form = useForm<DriverClientType>({
    defaultValues: {
      _id: initialData?._id || '',
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      suffix: initialData?.suffix || '',
      car_number: initialData?.car_number || '',
      hometown: initialData?.hometown || '',
    },
  });

  // Set hometown from initialData
  useEffect(() => {
    if (initialData?.hometown) {
      const parsedHometown = parseHometown(initialData.hometown);
      setHometown({
        city: parsedHometown.city || '',
        region: parsedHometown.region || '',
      });
    }
  }, [initialData]);

  // Handle form submission
  const onFormSubmit = async (data: DriverClientType) => {
    if (!hometown.city || !hometown.region) {
      form.setError('hometown', { message: 'City and region are required' });
      return;
    }
    try {
      const driverData: DriverClientType = {
        ...data,
        _id: initialData?._id,
        hometown: formatHometown(hometown),
      };
      let driver: DriverClientType;
      if (initialData?._id) {
        // Update existing driver
        driver = await postDriver(driverData) as DriverClientType;
        toast.success('Driver updated successfully!');
      } else {
        // Create new driver
        driver = await postDriver(driverData) as DriverClientType;
        toast.success('Driver created successfully!');
      }

      form.reset();
      setHometown({ city: '', region: '' });
      if (onSuccess) {
        onSuccess(driver);
      }
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (!onSuccess) {
        router.push(getLinks().getDriversUrl());
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error(initialData?._id ? 'Failed to update driver.' : 'Failed to create driver.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col gap-4 max-w-md">
        <h2 className="text-2xl font-bold">{initialData?._id ? 'Edit Driver' : 'Create Driver'}</h2>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="First Name"
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
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Last Name"
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
          name="suffix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suffix (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Suffix, e.g. Jr. or Sr."
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="car_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Car Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Car Number, e.g. 21K"
                  className="w-full"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Hometown City</FormLabel>
          <FormControl>
            <Input
              value={hometown.city}
              onChange={(e) => setHometown({ ...hometown, city: e.target.value })}
              placeholder="City, e.g. Coppock"
              className="w-full"
              required
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>State/Province/Territory</FormLabel>
          <FormControl>
            <Select
              value={hometown.region}
              onValueChange={(value) => setHometown({ ...hometown, region: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Submitting...' : initialData?._id ? 'Update Driver' : 'Create Driver'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            form.reset();
            setHometown({ city: '', region: '' });
          }}
        >
          Clear
        </Button>
      </form>
    </Form>
  );
}