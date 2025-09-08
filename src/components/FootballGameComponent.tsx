import { SimplifiedGame } from "@/types/football";

interface FootballGameComponentProps {
    game: SimplifiedGame;
}

const FootballGameComponent: React.FC<FootballGameComponentProps> = ({ game }) => {
    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold mb-2">{game.away_team} @ {game.home_team}</h2>
            <p className="mb-1"><strong>Commence Time:</strong> {new Date(game.commence_time).toLocaleString()}</p>
            <p className="mb-1"><strong>Bookmaker:</strong> {game.bookmaker}</p>
            <p className="mb-1"><strong>Spread Favorite:</strong> {game.spread_favorite}</p>
            <p className="mb-1"><strong>Spread Points:</strong> {game.spread_points}</p>
        </div>
    );
};

export default FootballGameComponent;