import { getNFLOddsFromFanduel } from "@/actions/getSportsData";
import FootballGameComponent from "@/components/FootballGameComponent";
import { SimplifiedGame } from "@/types/football";

export default async function SportsPage() {
  const games = await getNFLOddsFromFanduel();
  //console.log(convertGameToSimplified(games[0]));
  //const simplifiedGame = convertGameToSimplified(games[0]);

  return (
    <div>
      <h1>Nfl FanDuel Data</h1>
        {games.length > 0 ? games.map((game: SimplifiedGame) => (
            <FootballGameComponent key={game.id} game={game} />
        )) : (
            <div>No NFL games found.</div>
        )}
    </div>
  );
}