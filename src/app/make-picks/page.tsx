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
import { updateNcaaFootballGameWeekMatchups } from "@/actions/getOddsApi";
import { TabCardSkeleton } from "@/components/cards/tab-card";
import { PageActions, PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/page-header";
import { postSpreadPick } from "@/actions/postPick";


const title = "Make Picks";
const description = "Swipe the football left or right to make your selection."


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
        console.log("Posting picks to server:", predictions[predictions.length - 1]);
        await postSpreadPick(spreadPickRef.current);
      }

    };
    postData();

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


  if ((!matchups || matchups.length === 0)) {
    const updateMatchups = async () => {

      if (!gameWeek || !gameWeek._id) {
        console.error("No active game week found");
        return;
      }
      await updateNcaaFootballGameWeekMatchups(gameWeek._id as string);
    };
    return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">
      {isAdmin && <ServerActionButton label="Update Available Matchups" serverAction={updateMatchups} />}
      <p className="text-gray-600">No matchups available for week {gameWeek.week}.</p>
    </div>;
  }
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>
          {title}
        </PageHeaderHeading>
        <PageHeaderDescription>{description}</PageHeaderDescription>
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
          {/* {isAdmin && <ButtonUpdateAvailableWeekMatchups week={3} />} */}
        </PageActions>
      </PageHeader>
      <div className="flex flex-1 flex-col pb-6">
        <div className="theme-container container flex flex-1 flex-col gap-4">
          <Suspense fallback={<TabCardSkeleton />}>
            {matchups && matchups.length > 0 && matchups.map((matchup, index) => (
              <div key={index} className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
                <FootballSpreadPickerComponent matchup={matchup} gameWeek={gameWeek} predictions={predictions} setPredictions={setPredictions} player={player} />
              </div>
            ))}

          </Suspense>
        </div>
      </div>
    </div>
  );
}
