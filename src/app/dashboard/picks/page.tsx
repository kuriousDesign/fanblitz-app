"use client"

export const dynamic = 'force-dynamic';

import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
} from "@/components/page-header"
import { getCurrentPlayer, getPicksWithGamesByPlayerId } from '@/actions/getActions';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LinkButton } from "@/components/LinkButton";
import { getLinks } from "@/lib/link-urls";
import { CardPicksGame } from "@/components/cards/picks-game";
import { useEffect, useState } from "react";
//import { GameClientType } from "@/models/Game";
import { PickClientType } from "@/models/reference/Pick";
import { PlayerClientType } from "@/models/Player";
import Loading from "./loading";

const title = "Your Picks"


// not allowed with use client
// export const metadata: Metadata = {
//     title,
//     description,
// }
export default function PicksPage() {
    //const [games, setGames] = useState<GameClientType[]>([]);
    const [picks, setPicks] = useState<PickClientType[]>([]);
    const [filterLabel, setFilterLabel] = useState<string>('available');
    const [loading, setLoading] = useState<boolean>(true);
    const [player, setPlayer] = useState<PlayerClientType | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const player = await getCurrentPlayer() as PlayerClientType;
            setPlayer(player);
            if (player) {
                const picksWithGames = await getPicksWithGamesByPlayerId(player._id as string);
                //setGames(picksWithGames.games as GameClientType[]);
                // filter picksWithGames 
                setPicks(picksWithGames.picks as PickClientType[]);
            }
            setLoading(false);
        };
        fetchData();
        setLoading(false);
    }, []);

    if (loading) {
        return <Loading />
    }

    return (
        <div>
            <PageHeader>
                <PageHeaderHeading>{title}</PageHeaderHeading>
                <PageHeaderDescription>{player?.name}, here are your picks</PageHeaderDescription>
                <PageActions>
                    <LinkButton
                        variant='secondary'
                        size="sm"
                        href={getLinks().getGamesUrl()}>
                        Browse Games
                    </LinkButton>
                </PageActions>
            </PageHeader>
            <div className="container-wrapper section-soft flex flex-1 flex-col pb-6">
                <div className="theme-container container flex flex-1 flex-col gap-4">
                    <Tabs defaultValue="available" onValueChange={(value) => setFilterLabel(value)} >
                        <TabsList>
                            <TabsTrigger value="available" className="data-[state=active]:text-primary ">Available</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <CardPicksGame picks={picks} filterLabel={filterLabel} />
                </div>
            </div>
        </div>

    );
}