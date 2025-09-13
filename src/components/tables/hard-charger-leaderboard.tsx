import {
    Table,
    TableBody,
    TableCaption,
    TableCell,

    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { HardChargerTableClientType, HardChargerEntryClientType } from "@/models/reference/HardChargerTable";

function convertIndexToLetter(index: number): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[index % letters.length];
}

export default function TableHardChargerLeaderboard({ table }: { table?: HardChargerTableClientType }) {
    if (!table || table.entries.length === 0) {
        return <div className="text-center text-gray-500">No entries available.</div>;
    }
    //console.log('TableHardChargerLeaderboard', table);
    const entries: HardChargerEntryClientType[] = [...table.entries];

    // sort entries by total_cars_passed in descending order
    entries.sort((a, b) => b.total_cars_passed - a.total_cars_passed);
    // Assign ranks based on the sorted order
    entries.map((entry, index) => {
        let rank = 0;
        if (index === 0) {
            rank = 1; // First entry gets rank 1
        } else {
            // if number of cars passed is the same as previous entry, assign the same rank
            if (entry.total_cars_passed === entries[index - 1].total_cars_passed) {
                rank = entries[index - 1].rank; // Same rank as previous entry
            }
            else {
                rank = index + 1; // Otherwise, assign the next rank
            }
        }
        //ranks.push(rank);
        entry.rank = rank; // Assign the rank to the entry
    });

    // Create an array of table headers
    const tableHeads = [
        //{ label: "Rank", className: "text-center" },
        { label: "Driver", className: "text-left" },
        { label: "Total", className: "text-center font-bold " },
    ];
    // Dynamically add table headers based on the array of cars passed
    entries[0].cars_passed_by_race.forEach((_, index: number) => {
        tableHeads.push({ label: `${convertIndexToLetter(index)} Main`, className: "w-2 text-center text-secondary-foreground font-light" });
    });

    return (
        <Table className=''>
            <TableCaption>leaderboard of hard chargers</TableCaption>
            <TableHeader className="bg-secondary/90">
                <TableRow>
                    {tableHeads.map((head, index) => (
                        <TableHead key={index} className={head.className}>
                            {head.label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry: HardChargerEntryClientType, index: number) => (
                    <TableRow key={index}>
                        {/* <TableCell className="text-center">{entry.rank}</TableCell> */}
                        <TableCell className="text-left">{entry.driver_name}</TableCell>
                        <TableCell className="text-center text-primary font-bold">{entry.total_cars_passed}</TableCell>
                        {entry.cars_passed_by_race.map((carsPassed, raceIndex) => (
                            <TableCell key={raceIndex} className="text-center text-muted-foreground">
                                {carsPassed === 999 ? '-' : carsPassed}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}