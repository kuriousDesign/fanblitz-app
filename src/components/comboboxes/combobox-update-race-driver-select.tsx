'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RacerDriverClientType } from '@/models/reference/Racer';

interface ComboboxProps {
  options: RacerDriverClientType[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isUnknown?: boolean; // Flag to show separator for "Unknown" selection
}

export function ComboboxUpdateRaceDriverSelect({
  options,
  value,
  onChange,
  placeholder = 'Select a driver...',
  isUnknown = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Filter options based on search
  const filteredOptions = options.filter((option) => {
    const driver = option.driver;
    const searchLower = search.toLowerCase();
    return (
      driver._id === 'unknown' ||
      driver.first_name.toLowerCase().includes(searchLower) ||
      driver.last_name.toLowerCase().includes(searchLower) ||
      driver.car_number.toLowerCase().includes(searchLower) ||
      (driver.suffix && driver.suffix.toLowerCase().includes(searchLower))
    );
  });

  // Split options for "Unknown" case
  const unselectedOptions = filteredOptions.filter(
    (option) => option.racer._id === 'unknown' || !options.some((o) => o.racer._id === option.racer._id && o.racer._id !== value)
  );
  const otherOptions = filteredOptions.filter(
    (option) => option.racer._id !== 'unknown' && options.some((o) => o.racer._id === option.racer._id && o.racer._id !== value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.racer._id === value)?.driver
              ? `${options.find((option) => option.racer._id === value)!.driver.first_name} ${options.find((option) => option.racer._id === value)!.driver.last_name} ${options.find((option) => option.racer._id === value)!.driver.suffix || ''} - Car #${options.find((option) => option.racer._id === value)!.driver.car_number}`
              : 'Unknown'
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search driver..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No driver found.</CommandEmpty>
            <CommandGroup>
              {isUnknown
                ? [
                    ...unselectedOptions.map((option) => (
                      <CommandItem
                        key={option.racer._id}
                        value={option.racer._id as string}
                        onSelect={() => {
                          onChange(option.racer._id ? (option.racer._id === 'unknown' ? null : option.racer._id) : null);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === option.racer._id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option.racer._id === 'unknown'
                          ? 'Unknown'
                          : `${option.driver.first_name} ${option.driver.last_name} ${option.driver.suffix || ''} - Car #${option.driver.car_number}`}
                      </CommandItem>
                    )),
                    unselectedOptions.length > 0 && otherOptions.length > 0 ? (
                      <CommandSeparator key="separator" />
                    ) : null,
                    ...otherOptions.map((option) => (
                      <CommandItem
                        key={option.racer._id}
                        value={option.racer._id as string}
                        onSelect={() => {
                          onChange(option.racer._id ? (option.racer._id === 'unknown' ? null : option.racer._id) : null);
                          setOpen(false);
                          setSearch('');
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === option.racer._id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option.racer._id === 'unknown'
                          ? 'Unknown'
                          : `${option.driver.first_name} ${option.driver.last_name} ${option.driver.suffix || ''} - Car #${option.driver.car_number}`}
                      </CommandItem>
                    )),
                  ]
                : filteredOptions.map((option) => (
                    <CommandItem
                      key={option.racer._id}
                      value={option.racer._id as string}
                      onSelect={() => {
                        onChange(option.racer._id === 'unknown' ? null : (option.racer._id || null));
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.racer._id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.racer._id === 'unknown'
                        ? 'Unknown'
                        : `${option.driver.first_name} ${option.driver.last_name} ${option.driver.suffix || ''} - Car #${option.driver.car_number}`}
                    </CommandItem>
                  ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}