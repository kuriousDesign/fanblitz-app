
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { LinkButton } from "../LinkButton";
import { getLinks } from "@/lib/link-urls";
import { Separator } from "../ui/separator";
import { IoMdAddCircle } from "react-icons/io";
import { getIsAdmin } from "@/actions/userActions";
//import { SquarePen } from "lucide-react";

import { getGameWeeks } from "@/actions/getMatchups";
import { GameWeekClientType } from "@/models/GameWeek";
import ServerActionButton from "../buttons/ServerActionButton";
import { createAndPostGameWeeksForSeason } from "@/actions/postGameWeek";

export default async function CardGameWeeks() {
    const isAdmin = await getIsAdmin();
    const gameWeeks = await getGameWeeks();
    // sort the game weeks by week number ascending
    gameWeeks.sort((a, b) => (a.week || 0) - (b.week || 0));
    console.log("GameWeeks: ", gameWeeks.length);

    const create2025GameWeeks = async () => {
        "use server";
        console.log('Creating 2025 game weeks...');
        await createAndPostGameWeeksForSeason(2025);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>College Game Weeks 2025</CardTitle>
                <CardDescription>
                    Game weeks that will contain weekly matchups.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                {false && isAdmin && <LinkButton href={getLinks().getCreateGameWeekUrl()} size="lg" className="w-fit text-primary-foreground">
                    <IoMdAddCircle />
                    Game Week
                </LinkButton>}
                {isAdmin && gameWeeks.length < 1 && <ServerActionButton label="Create 2025 Game Weeks" serverAction={create2025GameWeeks} />}
                {gameWeeks?.map((gameWeek: GameWeekClientType) => (

                    <div key={gameWeek._id}>
                        <Button
                            className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"
                            variant='outline' >
                            <Link
                                href={getLinks().getGameWeekUrl(gameWeek._id || '')}
                                className="flex items-center gap-4 ">

                                <div className="flex flex-col gap-0.5 justify-start ">
                                    <p className="text-sm leading-none font-medium text-left">
                                        {gameWeek.name}
                                    </p>
                                    <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                                        <div className='text-primary'>Num Picks Per Player: {gameWeek.num_selections}</div>
                                        <Separator orientation="vertical" />
                                        <div>{`${gameWeek.start_date}`} - {`${gameWeek.end_date}`}</div>
                                        <Separator orientation="vertical" />
                                        <div></div>
                                    </div>
                                </div>
                            </Link>
                            {/* {isAdmin &&
                                <LinkButton
                                    size="sm"
                                    href={getLinks().getEditGameWeekUrl(gameWeek._id as string)}
                                    variant='ghost'

                                    className='rounded-l-full rounded-r-full z-100'
                                >
                                    <SquarePen />
                                </LinkButton>
                            } */}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};