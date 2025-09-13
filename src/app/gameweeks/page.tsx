import CardGameWeeks from "@/components/cards/game-weeks";

export default async function GameWeeksPage() {
    return (
        <div className='flex flex-col gap-4 w-full h-full p-4'>
            <CardGameWeeks />
        </div>
    );
}