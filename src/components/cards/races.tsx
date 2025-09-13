import { getRaces, getRacesByEventId } from "@/actions/getActions";
import { getLinks } from "@/lib/link-urls";
import { RaceClientType } from "@/models/reference/Race";
import Link from "next/link";
import { getIsAdmin } from "@/actions/userActions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { LinkButton } from "../LinkButton";
import { IoMdAddCircle } from "react-icons/io";
import { Separator } from "../ui/separator";
import { SquarePen } from "lucide-react";

export default async function RacesCard({ eventId }: { eventId: string }) {
    const isAdmin = await getIsAdmin();
    let races: RaceClientType[] = [];
    if (!eventId || eventId === "_") {
        races = await getRaces();
    } else {
        races = await getRacesByEventId(eventId);
    }

    if (!races) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md">
                {"loading races"}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Races</CardTitle>
                <CardDescription>
                    Active races for this event
                </CardDescription>
                {isAdmin && <LinkButton href={getLinks().getCreateRaceUrl(eventId)} size="lg" className="w-fit text-primary-foreground">
                    <IoMdAddCircle />
                    Race
                </LinkButton>}

            </CardHeader>
            <CardContent className="grid gap-6">
                {races?.map((race: RaceClientType) => (

                    <div key={race._id}>
                        <Button
                            className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"
                            variant='outline' >
                            <Link
                                href={getLinks().getRaceUrl(eventId as string,race._id as string)}
                                className="flex items-center gap-4 ">

                                <div className="flex flex-col gap-0.5 justify-start ">
                                    <p className="text-sm leading-none font-medium text-left">
                                        {race.letter} {race.type} </p>
                                    <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                                        <div className='text-primary'>{race.status}</div>
                                        <Separator orientation="vertical" />
                                        <div>{`Laps: ${race.laps}`}</div>
                                        <p className="font-medium">Cars: {race.num_cars}</p>

                                    </div>
                                </div>
                            </Link>
                            {isAdmin &&
                                <LinkButton
                                    size="sm"
                                    href={getLinks().getEditRaceUrl(eventId,race._id as string)}
                                    variant='ghost'

                                    className='rounded-l-full rounded-r-full z-100'
                                >
                                    <SquarePen />
                                </LinkButton>
                            }

                        </Button>


                    </div>
                ))}
            </CardContent>
        </Card>
    );

};