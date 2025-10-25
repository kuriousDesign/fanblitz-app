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
import { getCurrentWeekNcaaFootball, getCurrentWeekNcaaFootballSaturday, updateSpreadDataNcaaFootballGameWeekMatchups } from "@/actions/getOddsApi";
import { TabCardSkeleton } from "@/components/cards/tab-card";
import { PageActions, PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/page-header";
import { postSpreadPick } from "@/actions/postPick";

import { Button } from "@/components/ui";
import PicksIndicator from "./PicksIndicator";
import { GameStates } from "@/types/enums";
import { toast } from "sonner";
import PickTable from "@/components/tables/pick-table";
// import { updateOddsApiNcaaMatchupsScoresByGameWeek } from "@/actions/getOddsApi";


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
  const [currentSaturday, setCurrentSaturday] = useState<Date>(new Date());
  const [pickStatus, setPickStatus] = useState<'initialized' | 'picking' | 'picking_complete'>('initialized');

  const spreadPickRef = useRef<SpreadPickClientType | null>(null);
  const showResetButton = false;
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
      const currentWeek = await getCurrentWeekNcaaFootball();
      const currentSaturdayData = await getCurrentWeekNcaaFootballSaturday();
      if (!currentWeek || !currentSaturdayData) {
        console.error("No current game week found");
        return;
      }
      setCurrentSaturday(currentSaturdayData);
      const gameWeekData = await getGameWeekByWeek(currentWeek);
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

  // create an arrow functionthat updates matchups status
  const updatePickingComplete = () => {
    if (spreadPickRef.current) {
      spreadPickRef.current.status = 'picking_complete';
      setPickStatus('picking_complete');
      console.log("Status changed to picking_complete");
      // show toast message
      toast.success('Picks locked in! You can still edit your picks until the game week starts.', { duration: 5000 });
    }
  };
  // do thsame for picking active
  const updatePickingActive = () => {
    if (spreadPickRef.current) {
      spreadPickRef.current.status = 'picking';
      setPickStatus('picking');
      console.log("Status changed to picking");
    }
  };

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
        console.log("Status changed from initialized to picking");
      }
      // if you reached the number of selections, then change status to complete
      if (spreadPickRef.current.status === 'picking' && predictions.length >= (gameWeek?.num_selections || 0)) {
        //spreadPickRef.current.status = 'picking_complete';
        spreadPickRef.current.matchup_spread_predictions = predictions;
        console.log(`Number of games selected: ${predictions.length}`);
        await postSpreadPick(spreadPickRef.current);
      } else if (spreadPickRef.current.status === 'picking_complete' && predictions.length < (gameWeek?.num_selections || 0)) {
        spreadPickRef.current.status = 'picking';
        spreadPickRef.current.matchup_spread_predictions = predictions;
        //console.log("Posting picks to server:", predictions[predictions.length - 1]);
        console.log(`Number of games selected: ${predictions.length}`);
        await postSpreadPick(spreadPickRef.current);
      } else {
        spreadPickRef.current.matchup_spread_predictions = predictions;
        //console.log("Posting picks to server:", predictions[predictions.length - 1]);
        console.log(`Number of games selected: ${predictions.length}`);
        await postSpreadPick(spreadPickRef.current);
      }

    };
    postData();
    // update numGamesSelected
    setNumGamesSelected(predictions.length);


  }, [predictions, gameWeek, pickStatus]);

  if (isLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-background w-screen gap-1">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  if (!gameWeek) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-background w-screen gap-1">
      <p className="text-foreground">No open gameWeeks found, tell admin to open up the current week.</p>
    </div>;
  }

  // if no gameWeek or player
  if (!gameWeek || !player) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-background w-screen gap-1">
      <p className="text-foreground">Game week or player not found.</p>
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
  const resetPredictions = async () => {
    setPredictions([]);
    if (spreadPickRef.current) {
      spreadPickRef.current.matchup_spread_predictions = [];
      await postSpreadPick(spreadPickRef.current);
    }
  };

  if ((!matchups || matchups.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background w-screen gap-1">
        <p className="text-foreground">No matchups available for week {gameWeek.week}, update and then refresh page.</p>
        {isAdmin && <ServerActionButton label="Update Available Matchups" serverAction={updateMatchups} />}
      </div>
    );
  }

  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>
          Make College Week {gameWeek.week} Picks
        </PageHeaderHeading>
        <PageHeaderDescription>
          Saturday, {currentSaturday.toLocaleDateString()}
          {(() => {
            switch (gameWeek.status) {
              case GameStates.FINISHED:
                return (
                  <>
                    This game week has finished. Check back later for results.
                  </>
                );
              case GameStates.IN_PLAY:
                return (
                  <>
                    Games are currently in progress. No more picks can be made.
                    <br />
                    Check back after games complete to see results.
                  </>
                );
              case GameStates.OPEN:
                return (
                  <>
                    
                    <br />
                    You must pick a total of {gameWeek.num_selections} games to complete your picks.
                    <br />
                    Swipe the football left or right to make your selection, and tap cancel button to remove your pick.
                  </>
                );
              case GameStates.UPCOMING:
                return (
                  <>
                    This game week is not yet open for picks. Check back later to make your picks.
                  </>
                );
            }
          })()}
        </PageHeaderDescription>
        <PageActions>
          {showResetButton && <Button
            variant="outline"
            onClick={resetPredictions}

            hidden={predictions.length === 0}
          >
            Reset Picks
          </Button>}
          {predictions.length >= gameWeek.num_selections && spreadPickRef?.current?.status === 'picking' && 
            <Button
              onClick={updatePickingComplete}
              hidden={predictions.length === 0}
              className="animate-pulse-subtle"
            >
              Lock Picks
            </Button>
          }
            {predictions.length >= gameWeek.num_selections && spreadPickRef?.current?.status === 'picking_complete' && 
            <Button
              variant="outline"
              onClick={updatePickingActive}
              hidden={predictions.length === 0}
            >
              Edit Picks
            </Button>
          }
          {/* {isAdmin && <ServerActionButton label="Update Available Matchups" serverAction={updateMatchups} />} */}
          {/* {isAdmin && <ServerActionButton label="Update Scores" serverAction={updateScores} />} */}
        </PageActions>
        <div className={`mt-2 text-sm ${numGamesSelected >= gameWeek.num_selections ? 'text-green-600' : 'text-muted-foreground'}`}>
          {spreadPickRef?.current?.status === 'picking_complete' ? "Picks Submitted!" : `${numGamesSelected} of ${gameWeek.num_selections} games selected`}
          {numGamesSelected < gameWeek.num_selections && (
            <span className="block text-accent-foreground animate-pulse">Pick more games</span>
          )}
        </div>
      </PageHeader>
      {gameWeek.status === GameStates.OPEN &&
        <div className="flex flex-1 flex-col pb-6">
          <div className="theme-container container flex flex-1 flex-col gap-4 items-center">
            <Suspense fallback={<TabCardSkeleton />}>
              {matchups && matchups.length > 0 && spreadPickRef?.current?.status !== 'picking_complete' && matchups.map((matchup, index) => (
                <FootballSpreadPickerComponent key={index} matchup={matchup} predictions={predictions} setPredictions={setPredictions} disableSelect={numGamesSelected >= gameWeek.num_selections} />
              ))}
              {spreadPickRef?.current?.status !== 'picking_complete' && <PicksIndicator numPicks={numGamesSelected} numSelections={gameWeek.num_selections} />}
            </Suspense>
          </div>
        </div>
      }
       {spreadPickRef?.current?.status === 'picking_complete' && spreadPickRef.current && <PickTable spreadPick={spreadPickRef.current} matchups={matchups} />}
    </div>
  );
}
