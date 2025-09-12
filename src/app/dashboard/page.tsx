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

import ButtonUpdateAvailableWeekMatchups from "@/components/button-update-available-week-matchups";
import { getMatchupsByWeek } from "@/actions/getMatchups";
import FootballMatchupComponent from "@/components/FootballMatchupComponent";


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

    const matchups = await getMatchupsByWeek(3);

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
                    {isAdmin && <ButtonUpdateAvailableWeekMatchups week={3} />}

                    <LinkButton
                        href={getLinks().getMakePicksUrl()}>
                        Make Picks
                    </LinkButton>

                </PageActions>
            </PageHeader>
            <div className="flex flex-1 flex-col pb-6">
                <div className="theme-container container flex flex-1 flex-col gap-4">
                    <Suspense fallback={<TabCardSkeleton />}>
                        {/* <TabCardGames /> */}
                        {matchups && matchups.length > 0 ? (
                            <>
                                <div className="text-2xl font-bold mb-4 text-center">NCAA Week 3 Matchups: {matchups.length}</div>
                                {matchups.map((matchup, index) => (
                                    <FootballMatchupComponent key={index} matchup={matchup} />
                                ))}
                            </>
                        ) : (
                            <div>No NCAA games found.</div>
                        )}

                    </Suspense>
                </div>
            </div>
        </div>
    );
}