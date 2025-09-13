import { getGamesByStatus } from "@/actions/getActions";
import { GameClientType } from "@/models/reference/Game";
import Link from "next/link";


export default async function ActiveGamesDiv(){

    const statuses = ['created', 'open', 'locked', 'completed'];
    const gamePromises = statuses.map(status => getGamesByStatus(status));
    const gamesArrays = await Promise.all(gamePromises);
    const games = gamesArrays.flat() as GameClientType[];

    if (!games || games.length === 0) {
        console.log('No games found');
        return <div>games not found</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-2 space-x-2 w-fit">
            {games?.map((game:GameClientType) => (
                <Link 
                    key={game._id} 
                    href={`/dashboard/${game._id}`}
                    className="p-2 hover:bg-gray-50 rounded shadow-sm bg-gray-100 w-full px-4 flex items-center"
                >
                    <div className='flex flex-col gap-2 justify-start'>
                        <p className="font-bold text-2xl">{game.name}</p>
                        
                        <p className="font-bold text-gray-400"> Hard Chargers: {game.num_hard_chargers}</p>
                        <p className="font-bold text-gray-400"> Top Finishers: {game.num_top_finishers}</p>
                        <p className="font-bold text-gray-900"> Entry Fee: {game.entry_fee}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}