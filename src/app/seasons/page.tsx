import ServerActionButton from '@/components/buttons/ServerActionButton';
import { createAndPostGameWeeksForSeason } from '@/actions/postGameWeek';


export default async function SeasonsPage() {

    const create2025GameWeeks = async () => {
        "use server";
        console.log('Creating 2025 game weeks...');
        //const { updateNcaaFootballGameWeekMatchups } = await import('@/actions/getOddsApi');
        await createAndPostGameWeeksForSeason(2025);
    };

    return (
        <div className='flex flex-col gap-4 w-full h-full p-4'>
          <ServerActionButton label="Create 2025 Game Weeks" serverAction={create2025GameWeeks} />
        </div>
    );
}