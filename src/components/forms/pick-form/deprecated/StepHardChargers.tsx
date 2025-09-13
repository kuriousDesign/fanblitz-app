'use client';

import { PickClientType } from '@/models/reference/Pick';
import { useEffect, useState } from 'react';
import { RacerDriverClientType } from '@/models/reference/Racer';


export default function StepHardCharger({
  pickForm,
  setPickForm,
  racerDrivers
}: {
  pickForm: PickClientType;
  setPickForm: React.Dispatch<React.SetStateAction<PickClientType>>;
  racerDrivers: RacerDriverClientType[];
}) {
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    Array.from(pickForm.hard_chargers).forEach(prediction => {
      initial[prediction.driver_id] = prediction.prediction;
    });
    return initial;
  });

  const toggleRacer = (driverId: string) => {
    setSelected(prev => {
      const updated = { ...prev };
      if (driverId in updated) {
        delete updated[driverId];
      } else {
        updated[driverId] = 0;
      }
      return updated;
    });
  };

  const handlePredictionChange = (driverId: string, value: number) => {
    setSelected(prev => ({
      ...prev,
      [driverId]: value
    }));
  };

  useEffect(() => {
    setPickForm(prev => {
      const updatedHardChargers = Object.entries(selected).map(([driver_id, prediction]) => ({
        driver_id,
        prediction: Number(prediction),
        score: 0
      }));
      return {
        ...prev,
        hard_chargers: updatedHardChargers
      };
    });
  }, [selected, setPickForm]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Select Hard Chargers</h2>
      <p className="text-sm text-gray-500 mb-4">Choose racers and assign their position gain prediction.</p>
      <div className="space-y-4">
        {racerDrivers.map(racerDriver => {
        const {racer, driver} = racerDriver;
            if(!racer._id) return null; // Skip if racer has no ID
          const isSelected = racer._id in selected;
          return (
            <div
              key={racer._id}
              className="flex items-center gap-4 border p-2 rounded cursor-pointer"
              onClick={() => racer._id && toggleRacer(racer._id)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => racer._id && toggleRacer(racer._id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="flex-1">{driver.first_name} {driver.last_name}{driver.suffix ? ` ${driver.suffix}` : '' } </span>
              {isSelected && (
                <input
                  type="number"
                  value={selected[racer._id]}
                  onChange={(e) => handlePredictionChange(racer._id || '', parseInt(e.target.value) || 0)}
                  className="w-20 border rounded px-2 py-1"
                  min={0}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
