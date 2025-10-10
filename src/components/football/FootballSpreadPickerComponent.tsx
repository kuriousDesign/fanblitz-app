"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { X } from "lucide-react";

import { MatchupClientType } from "@/models/Matchup";
import { MatchupSpreadPredictionClientType } from "@/models/SpreadPick";

interface FootballPickerProps {
  matchup: MatchupClientType;
  predictions: MatchupSpreadPredictionClientType[];
  disableSelect: boolean;
  setPredictions: React.Dispatch<
    React.SetStateAction<MatchupSpreadPredictionClientType[]>
  >;
}

export default function FootballSpreadPickerComponent({
  matchup,
  predictions,
  disableSelect,
  setPredictions,
}: FootballPickerProps) {
  const { home_team: homeTeam, away_team: awayTeam } = matchup;
  const [selected, setSelected] = useState<"home" | "away" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDisabled = disableSelect && !selected;
  const startTime = new Date(matchup.game_date).toLocaleString();
  console.log('Matchup start time:', startTime);

  // 🔑 Sync local state with predictions from parent
  useEffect(() => {
    const existingPick = predictions.find(
      (prediction) => prediction.matchup_id === matchup._id
    );
    if (existingPick) {
      setSelected(existingPick.selection as "home" | "away" | null);
    } else {
      setSelected(null);
    }
  }, [predictions, matchup._id]);

  function handleSelection(selection: "home" | "away" | null) {
    const existingPickIndex = predictions.findIndex(
      (prediction) => prediction.matchup_id === matchup._id
    );

    if (existingPickIndex !== -1 && !selection) {
      // remove pick
      const updatedPicks = [...predictions];
      updatedPicks.splice(existingPickIndex, 1);
      setPredictions(updatedPicks);
    } else if (selection) {
      const newDate = new Date().toISOString();
      const newPrediction: MatchupSpreadPredictionClientType = {
        matchup_id: matchup._id as string,
        selection: selection,
        spread_points: matchup.spread,
        spread_favorite_team: matchup.spread_favorite_team as string,
        score: 0,
        createdOn: newDate,
        updatedOn: newDate,
      };

      if (existingPickIndex === -1) {
        // add new
        setPredictions([...predictions, newPrediction]);
      } else {
        // update existing
        newPrediction.createdOn = predictions[existingPickIndex].createdOn;
        const updatedPicks = [...predictions];
        updatedPicks[existingPickIndex] = newPrediction;
        setPredictions(updatedPicks);
      }
    }
  }

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    let newSelection: "home" | "away" | null = null;
    if (info.offset.x > 100) newSelection = "home";
    else if (info.offset.x < -100) newSelection = "away";

    setSelected(newSelection);
    handleSelection(newSelection);
  };

  const resetPick = () => {
    handleSelection(null);
    setSelected(null);
  };

  // create a team div so that i don't have to define home and away twice
  const TeamDiv = ({ team, isSelected }: { team: "home" | "away"; isSelected: boolean }) => (
    <div
      className={`flex-1 text-center text-md font-semibold h-20 ${isSelected
        ? "text-primary-foreground bg-primary rounded-md"
        : selected !== null
          ? "text-muted-foreground bg-none"
          : "text-accent-foreground bg-none"
        }`}
    >
      {team === "home" ? homeTeam : awayTeam}
      <div className={`text-sm font-normal ${isSelected
        ? "text-primary-foreground"
        : selected !== null
          ? "text-muted-foreground"
          : "text-foreground"
        }`}>
        {matchup.spread_favorite_team === (team === "home" ? 'home_team' : 'away_team') ? `(-${matchup.spread})` : `(+${matchup.spread})`}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md p-4 bg-secondary rounded-lg shadow-md relative">
      <div className="flex flex-col items-center w-full">
        <div className="flex w-full justify-center gap-8 items-center relative">
          <TeamDiv team="away" isSelected={selected === "away"} />

          {/* Football + Circle + Cancel */}
          <div className={`relative flex items-center justify-center ${isDisabled ? "pointer-events-none opacity-50" : ""}`}>
            <motion.div
              className={`absolute w-16 h-16 rounded-full ${selected ? "bg-gray-300/20" : "bg-gray-200"
                }`}
            />
            {selected && !isDragging && (
              <button
                onClick={resetPick}
                className="absolute z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            )}
            <motion.div
              className={`w-16 h-16 rounded-full flex items-center justify-center cursor-grab relative z-10 ${selected ? "bg-green-500/20 animate-pulse" : "bg-brown-600 shadow-lg"
                }`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              animate={{
                x: selected === "home" ? 140 : selected === "away" ? -140 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-2xl">🏈</span>
            </motion.div>
          </div>

          {/* Home Team */}
          <TeamDiv team="home" isSelected={selected === "home"} />
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center text-sm text-muted-foreground">
        {new Date(matchup.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
