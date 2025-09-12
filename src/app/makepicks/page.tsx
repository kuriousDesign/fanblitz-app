//import React from "react";
import { getMatchupsByWeek } from "@/actions/getMatchups";
import FootballPicker from "@/components/football/MatchSelectionComponent";

export default async function TestPage() {

  const matchups = await getMatchupsByWeek(3);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-screen gap-1">
        {matchups && matchups.length > 0 && matchups.map((matchup, index) => (
            <div key={index} className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
                <FootballPicker homeTeam={matchup.home_team} awayTeam={matchup.away_team} />
            </div>
        ))}
    </div>
  );
}
