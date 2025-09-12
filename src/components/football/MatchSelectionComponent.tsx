"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { X } from "lucide-react";

import { postPick } from "@/actions/postPick";
import { MatchupClientType } from "@/models/Matchup";

interface FootballPickerProps {
  matchup:MatchupClientType;
}

export default function FootballPicker({
  matchup,

}: FootballPickerProps) {
  const { home_team: homeTeam, away_team: awayTeam } = matchup;
  const [selected, setSelected] = useState<"home" | "away" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    let newSelection: "home" | "away" | null = null;
    if (info.offset.x > 100) newSelection = "home";
    else if (info.offset.x < -100) newSelection = "away";

    setSelected(newSelection);
  };

  // might need to useEffect with ties to selected to call the onPickChange function
  useEffect(() => {

    // define an async function here to call 
    const notifyPickChange = async () => {
      const pick = selected ? selected as string : null;
      if (!pick) return;
      console.log("notifying pick change:", pick);
      await postPick(pick);
    };
    notifyPickChange();
  }, [selected]);

  const resetPick = () => {
    setSelected(null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full justify-center gap-8 items-center relative">
        {/* Away Team */}
        <div
          className={`flex-1 text-center text-md font-semibold h-20 ${
            selected === "away" ? "text-yellow-500 bg-black" : "text-gray-800 bg-black/0"
          }`}
        >
          {awayTeam}
        </div>

        {/* Football + Circle + Cancel */}
        <div className="relative flex items-center justify-center">
          {/* Background circle */}
          <motion.div
            className={`absolute w-16 h-16 rounded-full ${
              selected ? "bg-gray-300/20" : "bg-gray-200"
            }`}
            animate={{ scale: selected ? 1.0 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          {/* Cancel button */}
          {selected && !isDragging && (
            <button
              onClick={resetPick}
              className="absolute z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Football draggable */}
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center cursor-grab relative z-10 ${
              selected ? "bg-green-500/20 animate-pulse" : "bg-brown-600 shadow-lg"
            }`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            initial={{ x: 0 }}
            animate={{
              x: selected === "home" ? 140 : selected === "away" ? -140 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <span className="text-2xl">🏈</span>
          </motion.div>
        </div>

        {/* Home Team */}
        <div
          className={`flex-1 text-center text-md font-semibold h-20 ${
            selected === "home" ? "text-pink-500 bg-black" : "text-gray-800 bg-black/0"
          }`}
        >
          {homeTeam}
        </div>
      </div>
    </div>
  );
}
