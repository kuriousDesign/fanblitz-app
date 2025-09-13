
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
import { SquarePen } from "lucide-react";
import { getEvents } from "@/actions/getActions";
import { EventClientType } from "@/models/reference/Event";

export default async function CardEvents() {
    const isAdmin = await getIsAdmin();
    const events = await getEvents();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>
                    Active events that you can add races and then games to
                </CardDescription>


            </CardHeader>
            <CardContent className="grid gap-2">
                {isAdmin && <LinkButton href={getLinks().getCreateEventUrl()} size="lg" className="w-fit text-primary-foreground">
                    <IoMdAddCircle />
                    Event
                </LinkButton>}
                {events?.map((event: EventClientType) => (

                    <div key={event._id}>
                        <Button

                            className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"

                            variant='outline' >
                            <Link
                                href={getLinks().getEventUrl(event._id || '')}
                                className="flex items-center gap-4 ">

                                <div className="flex flex-col gap-0.5 justify-start ">
                                    <p className="text-sm leading-none font-medium text-left">
                                        {event.name}
                                    </p>
                                    <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                                        <div className='text-primary'>{event.location}</div>
                                        <Separator orientation="vertical" />
                                        <div>{`${event.date}`}</div>
                                    </div>
                                </div>
                            </Link>
                            {isAdmin &&
                                <LinkButton
                                    size="sm"
                                    href={getLinks().getEditEventUrl(event._id as string)}
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