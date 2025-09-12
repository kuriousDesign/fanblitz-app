import { MatchupClientType } from "@/models/Matchup";

interface FootballGameComponentProps {
    matchup: MatchupClientType;
}

const FootballMatchupComponent: React.FC<FootballGameComponentProps> = ({ matchup }) => {
    const commenceDate = new Date(matchup.game_date).toLocaleString();
    return (
        <div className="p-4 border rounded-lg shadow-md bg-secondary">
            <h2 className="text-xl text-secondary-foreground font-bold mb-2">{matchup.away_team} @ {matchup.home_team}</h2>
            <p className="mb-1"><strong>Commence Time:</strong> {commenceDate}</p>
            <p className="mb-1"><strong>Bookmaker:</strong> {matchup.bookmaker}</p>
            <p className="mb-1"><strong>Spread Favorite:</strong> {matchup.spread_favorite_team}</p>
            <p className="mb-1"><strong>Spread Points:</strong> {matchup.spread}</p>
        </div>
    );
};

export default FootballMatchupComponent;