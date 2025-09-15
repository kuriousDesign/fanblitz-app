"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { getGameWeekByWeek, getMatchupsByGameWeek as getMatchupsByGameWeek, getSpreadPickByPlayerAndGameWeek } from "@/actions/getMatchups";
import FootballSpreadPickerComponent from "@/components/football/FootballSpreadPickerComponent";
import { MatchupClientType } from "@/models/Matchup";
import { MatchupSpreadPredictionClientType, SpreadPickClientType } from "@/models/SpreadPick";
import { PlayerClientType } from "@/models/Player";
import { getCurrentPlayer } from "@/actions/getActions";
// import { useParams } from "next/navigation";
import { GameWeekClientType } from "@/models/GameWeek";
import ServerActionButton from "@/components/buttons/ServerActionButton";
import { getIsAdmin } from "@/actions/userActions";
import { updateSpreadDataNcaaFootballGameWeekMatchups } from "@/actions/getOddsApi";
import { TabCardSkeleton } from "@/components/cards/tab-card";
import { PageActions, PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/page-header";
import { postSpreadPick } from "@/actions/postPick";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";


export function PicksIndicator({
  numPicks,
  numSelections,
}: {
  numPicks: number;
  numSelections: number;
}) {
  const percentage = Math.min((numPicks / numSelections) * 100, 100);
  const radius = 30; // larger radius for smoother look
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="fixed bottom-3 right-3">
      <motion.div
        className="relative w-20 h-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <svg className="w-full h-full rotate-[-90deg]">
          {/* background track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth={stroke}
            fill="none"
          />
          {/* animated progress */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={percentage === 100 ? "#22c55e" : "#3b82f6"} // green-500 if full, blue-500 otherwise
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset:
                circumference - (percentage / 100) * circumference,
            }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>

        {/* center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {numPicks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            picks
          </span>
        </div>

        {/* pulse animation when complete */}
        {percentage === 100 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.2,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}


export default function MakePicksPage() {

  //useParams to get week id from url
  //const params = useParams();
  //const { gameWeekId } = params;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [predictions, setPredictions] = useState<MatchupSpreadPredictionClientType[]>([]);
  const [matchups, setMatchups] = useState<MatchupClientType[]>([]);
  const [player, setPlayer] = useState<PlayerClientType | null>(null); // Example player ID
  const [gameWeek, setGameWeek] = useState<GameWeekClientType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [numGamesSelected, setNumGamesSelected] = useState<number>(0);

  const spreadPickRef = useRef<SpreadPickClientType | null>(null);
  // fetch matchups on load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const playerData = await getCurrentPlayer();
      if (!playerData || !playerData._id) {
        console.error("No player data found");
        return;
      }

      //const gameWeekData = await getActiveGameWeek();
      const gameWeekData = await getGameWeekByWeek(4); // temp fix to week 4
      if (!gameWeekData || !gameWeekData._id) {
        console.error("No active game week found");
        return;
      }
      const matchupsPromise = getMatchupsByGameWeek(gameWeekData._id);
      const spreadPickPromise = getSpreadPickByPlayerAndGameWeek(playerData._id, gameWeekData._id);
      const [matchupsData, spreadPickData] = await Promise.all([matchupsPromise, spreadPickPromise]);

      setIsAdmin(await getIsAdmin());
      setGameWeek(gameWeekData);
      setMatchups(matchupsData);
      setPlayer(playerData);

      if (spreadPickData) {
        spreadPickRef.current = spreadPickData;
        setNumGamesSelected(spreadPickData.matchup_spread_predictions?.length || 0);
        console.log("Loaded", spreadPickData.matchup_spread_predictions.length, "existing picks from database");
      } else {
        spreadPickRef.current = {
          name: playerData.name,
          player_id: playerData._id,
          game_week_id: gameWeekData._id,
          score_total: 0,
          outcome: null,
          matchup_spread_predictions: [],
          nickname: 'week ' + gameWeekData.week + ' pick',
          is_paid: false,
          status: 'initialized',
          rank: 0,
          payout: 0
        };
      }

      setPredictions(spreadPickRef.current.matchup_spread_predictions || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // post picks when selections change
  useEffect(() => {
    const postData = async () => {
      // Post picks to server
      if (!spreadPickRef.current) {
        //console.error("No spreadPickRef current");
        return;
      }
      if (predictions.length > 0 && spreadPickRef.current.status === 'initialized') {
        spreadPickRef.current.status = 'picking';
      }



      if (spreadPickRef.current.status === 'picking') {
        spreadPickRef.current.matchup_spread_predictions = predictions;
        //console.log("Posting picks to server:", predictions[predictions.length - 1]);
        console.log(`Number of games selected: ${predictions.length}`);
        await postSpreadPick(spreadPickRef.current);
      }

    };
    postData();
    // update numGamesSelected
    setNumGamesSelected(predictions.length);


  }, [predictions]);

  if (isLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">
      <p className="text-gray-600">Loading...</p>
    </div>;
  }

  if (!gameWeek) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">
      <p className="text-gray-600">No open gameWeeks found, tell admin to open up the current week.</p>
    </div>;
  }

  // if no gameWeek or player
  if (!gameWeek || !player) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">
      <p className="text-gray-600">Game week or player not found.</p>
    </div>;
  }

  const updateMatchups = async () => {

    if (!gameWeek || !gameWeek._id) {
      console.error("No active game week found");
      return;
    }
    await updateSpreadDataNcaaFootballGameWeekMatchups(gameWeek._id as string);
  };

  // create a function that will reset all prediction
  const resetPredictions = () => {
    setPredictions([]);
    if (spreadPickRef.current) {
      spreadPickRef.current.matchup_spread_predictions = [];
    }
  };

  if ((!matchups || matchups.length === 0)) {

    return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">

      <p className="text-gray-600">No matchups available for week {gameWeek.week}, update and then refresh page.</p>
      {isAdmin && <ServerActionButton label="Update Available Matchups" serverAction={updateMatchups} />}


    </div>;
  }

  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>
          Make Week {gameWeek.week} Picks
        </PageHeaderHeading>
        <PageHeaderDescription>
          {new Date(gameWeek.start_date).toLocaleDateString()} - {new Date(gameWeek.end_date).toLocaleDateString()}
          <br />
          You must pick a total of {gameWeek.num_selections} games to complete your picks.
          <br />
          Swipe the football left or right to make your selection, and tap cancel button to remove your pick.
        </PageHeaderDescription>
        <PageActions>
          {/* {isAdmin &&
            <LinkButton
              href={getLinks().getSeasonsUrl()}>
              Seasons
            </LinkButton>
          }
          {isAdmin &&
            <LinkButton
              href={getLinks().getGameWeeksUrl()}>
              Game Weeks
            </LinkButton>
          } */}
          <Button
            variant="outline"
            onClick={resetPredictions}

            hidden={predictions.length === 0}
          >
            Reset Picks
          </Button>
          {isAdmin && <ServerActionButton label="Update Available Matchups" serverAction={updateMatchups} />}
        </PageActions>
        <div className="mt-2 text-sm text-gray-600">
          {numGamesSelected} of {gameWeek.num_selections} games selected
        </div>
      </PageHeader>
      <div className="flex flex-1 flex-col pb-6">
        <div className="theme-container container flex flex-1 flex-col gap-4 items-center">

          <Suspense fallback={<TabCardSkeleton />}>
            {matchups && matchups.length > 0 && matchups.map((matchup, index) => (
              <div key={index} className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
                <FootballSpreadPickerComponent matchup={matchup} predictions={predictions} setPredictions={setPredictions} />
              </div>
            ))}

            <PicksIndicator numPicks={numGamesSelected} numSelections={gameWeek.num_selections} />

          </Suspense>
        </div>
      </div>
    </div>
  );
}
