import {
    Table,
    TableBody,
    //TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Separator } from "../ui/separator";
import { SpreadPickClientType } from "@/models/SpreadPick";
import { PopoverSpreadPickDetails } from "../popover-spreadpick-details ";
import { MatchupClientType } from "@/models/Matchup";
import { GameStates } from "@/types/enums";


export function convertIndexToLetter(index: number): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[index % letters.length];
}

export default async function TableSpreadPickLeaderboard({ picks, matchups, gameStatus }: { picks: SpreadPickClientType[], matchups: MatchupClientType[], gameStatus: GameStates }) {
    if (!picks || picks.length === 0) {
        return <div className="text-center text-gray-500">No picks available.</div>;
    }

    // sort picks by rank in best to worst order
    picks.sort((a, b) => a.rank - b.rank);

    // Create an array of table headers
    const tableHeads = [
        { label: "Rank", className: "text-center" },
        { label: "Name", className: "text-center font-bold" },
        { label: "Score", className: "text-center" },
        { label: "Details", className: "text-center" },
    ];
    if (gameStatus === GameStates.IN_PLAY) {
        //tableHeads.push({ label: "Spread", className: "text-left" });
    } else if (gameStatus === GameStates.FINISHED) {
        //tableHeads.push({ label: "Correct?", className: "text-left" });
    }

    return (
        <Table>
            {/* <TableCaption>leaderboard of player picks</TableCaption> */}
            <TableHeader>
                <TableRow>
                    {tableHeads.map((head, index) => (
                        <TableHead key={index} className={head.className}>
                            {head.label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {picks.map((pick: SpreadPickClientType, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="text-center">{pick.rank}</TableCell>
                        <TableCell className="text-center font-bold">{pick.name}</TableCell>
                        <TableCell className="text-center text-primary font-bold">{Number(pick.score_total.toFixed(3)).toString()}</TableCell>
                        <TableCell className="text-center">
                            <PopoverSpreadPickDetails spreadPick={pick} matchups={matchups} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


// create a skeleton for the pick leaderboard table that shows same number of columns as the actual table, and a few rows of skeleton blocks
export function PickLeaderboardSkeleton() {
    // use rounded rectangles to simulate table cells, no text at all, just a few rows. use grid instead of table for skeleton. one header row that is slightly darker and then 5 rows that are less opaque
    return (
        <div className="animate-pulse">
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-secondary h-8 rounded-md col-span-4"></div>

                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="col-span-4 grid grid-cols-4 gap-2">
                        <Separator className="col-span-4" />
                        <div className="bg-muted/80 h-6 rounded-md" />
                        <div className="bg-muted/80 h-6 rounded-md col-span-2" />
                        <div className="bg-muted/80 h-6 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}