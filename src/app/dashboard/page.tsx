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
//import { getIsAdmin } from "@/actions/userActions";

//import TabCardGames from "@/components/tab-cards/games";
import { Suspense } from "react";
import { postNewPlayerWithUser } from "@/actions/postActions";
import { DefaultUser } from "@auth/core/types";
import { getGameWeekByWeek } from "@/actions/getMatchups";
import { GameStates } from "@/types/enums";
import { getCurrentWeekNcaaFootball } from "@/actions/getOddsApi";


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
    //const isAdmin = await getIsAdmin();
    const currentWeek = await getCurrentWeekNcaaFootball();
    if (!currentWeek) {
        return <div>No current week found</div>;
    }

    const currentGameWeek = await getGameWeekByWeek(currentWeek);
    if (!currentGameWeek || !currentGameWeek._id) {
        return <div>No game week found for week {currentWeek}</div>;
    }

    return (
        <div>
            <PageHeader>
                <PageHeaderHeading>
                    {title}
                </PageHeaderHeading>
                <PageHeaderDescription>
                    {description}
                </PageHeaderDescription>
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">
                        🏆 WIN $100,000 with the FanBlitz Football Challenge!
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                        Free to play. Make your game picks each week for a chance at $100k. 
                        Pick every game correct for the week and win big!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-3 rounded border">
                            {player.free_picks_earned && player.free_picks_earned && (player.free_picks_used ?? 0) < player.free_picks_earned ? (
                            <>
                                <h4 className="font-semibold text-green-700">Your Free Picks this Week:</h4>
                                <p className="text-2xl font-bold text-green-600">{player.free_picks_earned - (player.free_picks_used ?? 0)}</p>
                            </>
                            ) : (
                            <p className="text-sm text-gray-600">No free picks available this week.</p>
                            )}
                            <LinkButton 
                                size="sm" 
                                variant="outline" 
                                href="/earn-picks"
                                className="mt-2"
                            >
                                Unlock More Picks
                            </LinkButton>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                            <h4 className="font-semibold text-orange-700">Week {currentGameWeek.week} Picks</h4>
                            <p className="text-xs text-gray-600">
                                Lock in by {new Date('2024-01-06T16:59:00Z').toLocaleString(undefined, {
                                    weekday: 'long',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    timeZoneName: 'short'
                                })}
                            </p>
                            <LinkButton 
                                size="sm" 
                                href={getLinks().getMakePicksUrl()}
                                className="mt-2"
                            >
                                Learn How to Pick
                            </LinkButton>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                        See official rules for details.
                    </p>
                </div>
                <PageActions>
                    <LinkButton
                        href={getLinks().getGameWeekUrl(currentGameWeek._id)}>
                        See Game Week {currentGameWeek.week}
                    </LinkButton>
                    {currentGameWeek.status === GameStates.OPEN && <LinkButton
                        href={getLinks().getMakePicksUrl()}>
                        Make Picks
                    </LinkButton>}
                    <LinkButton
                        variant="outline"
                        href={getLinks().getGameWeeksUrl()}>
                        All Weeks
                    </LinkButton>
                </PageActions>
            </PageHeader>
            <div className="flex flex-1 flex-col pb-6">
                <div className="theme-container container flex flex-1 flex-col gap-4">
                    <Suspense fallback={<TabCardSkeleton />}>
                        {/* <TabCardGames /> */}
                        {/* {matchups && matchups.length > 0 ? (
                            <>
                                <div className="text-2xl font-bold mb-4 text-center">NCAA Week 3 Matchups: {matchups.length}</div>
                                {matchups.map((matchup, index) => (
                                    <FootballMatchupComponent key={index} matchup={matchup} />
                                ))}
                            </>
                        ) : (
                            <div>No NCAA games found.</div>
                        )} */}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}