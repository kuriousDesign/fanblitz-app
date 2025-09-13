"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { X } from "lucide-react";

import { MatchupClientType } from "@/models/Matchup";
import { SpreadPickClientType } from "@/models/SpreadPick";
import { GameWeekClientType } from "@/models/GameWeek";
import { PlayerClientType } from "@/models/Player";

interface FootballPickerProps {
  matchup:MatchupClientType;
  gameWeek: GameWeekClientType;
  player: PlayerClientType;
  picks: SpreadPickClientType[];
  setPicks: React.Dispatch<React.SetStateAction<SpreadPickClientType[]>>;
}

export default function FootballSpreadPickerComponent({
  matchup,
  gameWeek,
  player,
  picks,
  setPicks,

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
    // if matchup.matchup_id is not defined as an entry of picks array, then add it, otherwise update it


  // might need to useEffect with ties to selected to call the onPickChange function
  useEffect(() => {

    const existingPickIndex = picks.findIndex(pick => pick.matchup_id === matchup._id);
    // if existing pick index and selected is null, then remove it from picks
    if (existingPickIndex !== -1 && !selected) {
      const updatedPicks = [...picks];
      updatedPicks.splice(existingPickIndex, 1);
      setPicks(updatedPicks);
    } 
    
    else if (selected) {

      const newDate = new Date().toISOString();
      const newPick: SpreadPickClientType = {
        matchup_id: matchup._id as string,
        player_id: player._id as string,
        selection: selected,
        spread: matchup.spread,
        spread_favorite_team: matchup.spread_favorite_team as string,
        game_week_id: gameWeek._id as string,
        createdOn: newDate,
        updatedOn: newDate,
      };
      // add a new pick to the picks array
      if (existingPickIndex === -1) {
      const newPick: SpreadPickClientType = {
        matchup_id: matchup._id as string,
        player_id: "currentUserId", // Replace with actual user ID
        selection: selected,
        spread: matchup.spread,
        spread_favorite_team: matchup.spread_favorite_team as string,
        game_week_id: gameWeek._id as string,
        createdOn: newDate,
        updatedOn: newDate,
      };
      setPicks([...picks, newPick]);
      } 
      // Update existing pick
      else {
        newPick.createdOn = picks[existingPickIndex].createdOn;
        const updatedPicks = [...picks];
        updatedPicks[existingPickIndex] = newPick;
        setPicks(updatedPicks);
      }
    }
  }, [selected, matchup, picks, setPicks, gameWeek, player]);

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
