export const experimental_ppr = true;

import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
} from "@/components/page-header"
import { getCurrentPlayer, getUser } from '@/actions/getActions';

import { Metadata } from "next";
import { LinkButton } from "@/components/LinkButton";
import { getLinks } from "@/lib/link-urls";
import { TabCardSkeleton } from "@/components/cards/tab-card";
import { getIsAdmin } from "@/actions/userActions";

//import TabCardGames from "@/components/tab-cards/games";
import { Suspense } from "react";
import { postNewPlayerWithUser } from "@/actions/postActions";
import { DefaultUser } from "@auth/core/types";

//import DivShimmer from "@/components/div-shimmer";
//import { shimmerBrightColor, shimmerDullColor, shimmerSensitivity } from "@/lib/shimmer-colors";
//import { getNFLOddsFromFanduel } from "@/actions/getSportsData";
import { getNFLGamesForWeek } from "@/actions/getEspnApiData";
//import FootballGameComponent from "@/components/FootballGameComponent";
import { getNFLWeek1GamesWithOdds } from "@/actions/getEspnApiOdds";
import FootballGameComponent from "@/components/FootballGameComponent";


const title = "Dashboard";
const description = "Find a game and create a pick. Look at your current picks too."

export const metadata: Metadata = {
    title: 'dashboard',
    description,
}
export default async function DashboardPage() {
    
    const user = await getUser();
    if (!user || !user.id) {
        console.log('No user found, redirecting to sign in', user);
        return null;
    }
    let player = await getCurrentPlayer();

    if (!player || !player._id) {
        console.log('No player found, creating a new player for user', user);
        //create a new player using user
        await postNewPlayerWithUser(user as DefaultUser);
        player = await getCurrentPlayer();
    }
    const isAdmin = await getIsAdmin();

    const games = await getNFLGamesForWeek(1);
    if (games && games.length > 0) {
        //console.log('NFL Games for Week 1:', games[0]);
    }

    const gamesWithOdds = await getNFLWeek1GamesWithOdds();
    if (gamesWithOdds && gamesWithOdds.length > 0) {
        console.log('NFL Games with Odds for Week 1:', gamesWithOdds[0]);
    }

    //brightColor hsv: 38, 45, 100
//dullColor hsv: 38, 100, 63


    return (
        <div>
            <PageHeader>
                <PageHeaderHeading>
                    {title}
                </PageHeaderHeading>
                <PageHeaderDescription>{description}</PageHeaderDescription>
                <PageActions>
                    {isAdmin &&
                        <LinkButton
                            href={getLinks().getEventsUrl()}>
                            Events
                        </LinkButton>
                    }
           
                </PageActions>
            </PageHeader>
            <div className="flex flex-1 flex-col pb-6">
                <div className="theme-container container flex flex-1 flex-col gap-4">
                    <Suspense fallback={<TabCardSkeleton />}>
                        {/* <TabCardGames /> */}
                        {gamesWithOdds && gamesWithOdds.length > 0 ? (
                            gamesWithOdds.map((game, index) => (
                                <FootballGameComponent key={index} game={game} />
                            ))
                        ) : (
                            <div>No NFL games found.</div>
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}