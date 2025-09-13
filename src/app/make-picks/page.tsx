"use client";

import { Suspense, useEffect, useState } from "react";
import { getActiveGameWeek, getMatchupsByGameWeek as getMatchupsByGameWeek, getSpreadPicksByPlayerAndGameWeek } from "@/actions/getMatchups";
import FootballSpreadPickerComponent from "@/components/football/FootballSpreadPickerComponent";
import { MatchupClientType } from "@/models/Matchup";
import { SpreadPickClientType } from "@/models/SpreadPick";
import { PlayerClientType } from "@/models/Player";
import { getCurrentPlayer } from "@/actions/getActions";
// import { useParams } from "next/navigation";
import { GameWeekClientType } from "@/models/GameWeek";
import ServerActionButton from "@/components/buttons/ServerActionButton";
import { getIsAdmin } from "@/actions/userActions";
import { updateNcaaFootballGameWeekMatchups } from "@/actions/getOddsApi";
import { TabCardSkeleton } from "@/components/cards/tab-card";
import { PageActions, PageHeader, PageHeaderHeading, PageHeaderDescription } from "@/components/page-header";


const title = "Make Picks";
const description = "Swipe the football left or right to make your selection."


export default function MakePicksPage() {

  //useParams to get week id from url
  //const params = useParams();
  //const { gameWeekId } = params;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [picks, setPicks] = useState<SpreadPickClientType[]>([]);
  const [matchups, setMatchups] = useState<MatchupClientType[]>([]);
  const [player, setPlayer] = useState<PlayerClientType | null>(null); // Example player ID
  const [gameWeek, setGameWeek] = useState<GameWeekClientType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // fetch matchups on load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const playerData = await getCurrentPlayer();
      if (!playerData || !playerData._id) {
        console.error("No player data found");
        return;
      }

      const gameWeekData = await getActiveGameWeek();
      if (!gameWeekData || !gameWeekData._id) {
        console.error("No active game week found");
        return;
      }
      const matchupsPromise = getMatchupsByGameWeek(gameWeekData._id);
      const picksPromise = getSpreadPicksByPlayerAndGameWeek(playerData._id, gameWeekData._id);
      const [matchupsData, picksData] = await Promise.all([matchupsPromise, picksPromise]);

      setIsAdmin(await getIsAdmin());
      setGameWeek(gameWeekData);
      setMatchups(matchupsData);
      setPlayer(playerData);
      setPicks(picksData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // post picks when selections change
  useEffect(() => {
    const postData = async () => {
      // Post picks to server
      if (picks && picks.length > 0) {
        console.log("Posting picks to server:", picks);
        // await postPicks(picks);
      }
    };
    postData();

  }, [picks]);

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
                <FootballSpreadPickerComponent matchup={matchup} gameWeek={gameWeek} picks={picks} setPicks={setPicks} player={player} />
              </div>
            ))}

          </Suspense>
        </div>
      </div>
    </div>
  );
}
