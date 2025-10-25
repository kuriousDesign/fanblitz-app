export const experimental_ppr = true;
import { Suspense } from 'react';

//import { getCurrentPlayer } from '@/actions/getActions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
} from "@/components/page-header"
import { LinkButton } from "@/components/LinkButton"
import { getLinks } from "@/lib/link-urls"
import ButtonUpdateGameWeekLeaderboard from '@/components/buttons/button-update-gameWeek-leaderboard';
import { getIsAdmin } from '@/actions/userActions';

//import { FilterOption } from '@/components/cards/tab-card';
//import PeekDiv from '@/components/cards/pick-div';
import { GameStates, gameStateToString } from '@/types/enums';

//import CardWinningPick from '@/components/card-winning-pick';
import { getGameWeek, getMatchupsByGameWeek, getSpreadPicks } from '@/actions/getMatchups';
import { SpreadPickClientType } from '@/models/SpreadPick';
import TableSpreadPickLeaderboard, { PickLeaderboardSkeleton } from '@/components/tables/spreadpick-leaderboard';
import BtnChangeGameWeekState from '@/components/button-change-gameweek-state';
import { GameWeekClientType } from '@/models/GameWeek';
import { getSaturdayOfGameWeek } from '@/types/helpers';
import ServerActionButton from '@/components/buttons/ServerActionButton';
import { sendGameWeekReport } from '@/actions/reportActions';

// import Card from '@/components/ui/card';

export default async function GameWeekPage({ params }: { params: Promise<{ gameWeekId: string }> }) {
    //const playerPromise = getCurrentPlayer();
    const isAdminPromise = getIsAdmin();
    const { gameWeekId } = await params;
    //updateSpreadPicksScoresByGameWeek(gameWeekId);

    const filter = { game_week_id: gameWeekId };
    const picksPromise = getSpreadPicks(filter);
    const matchupsPromise = getMatchupsByGameWeek(gameWeekId);

    const gameWeek = await getGameWeek(gameWeekId);
    if (!gameWeek) {
        return <div>Game Week not found</div>;
    }

    const [isAdmin, matchups, picks] = await Promise.all([
        //playerPromise,
        isAdminPromise,
        matchupsPromise,
        picksPromise,
    ]);

    const sendReport = async () => {
        "use server";
        sendGameWeekReport(gameWeekId);
    };  

    const winningPicks: SpreadPickClientType[] = [];

    // Define filterable options
    // const filterableOptionsPicks = [
    //     { key: "player_id", value: null, tabLabel: 'All' }, // "All" tab
    //     { key: "player_id", value: player?._id, tabLabel: 'Yours' }, // "My Picks" tab
    // ] as FilterOption[];

    const title = gameWeek.name
    // put game week week number as desc


    // i need a switch case statement to handle showing the picks leaderboard vs picks card, based on game.status
    let showLeaderboard = false;
    let showMakePicksBtn = false;
    let showUpdateScoresBtn = false;
    switch (gameWeek.status) {
        case GameStates.OPEN:
            showLeaderboard = true;
            showMakePicksBtn = true;
            break;
        case GameStates.IN_PLAY:
            showLeaderboard = true;
            showUpdateScoresBtn = true;
            break;
        case GameStates.FINISHED:
            showLeaderboard = true;
            //find winning picks, looking for ties amongs the sorted picks
            winningPicks.push(picks[0]); // first pick is the winner
            for (let i = 1; i < picks.length; i++) {
                if (picks[i].score_total === picks[0].score_total) {
                    winningPicks.push(picks[i]); // add to winning picks if score is the same
                }
                else if (picks[i].score_total > picks[0].score_total) {
                    // trigger toast error if somehow the picks are out of order
                    //console.error('Picks are not sorted by score_total in descending order');
                    //winningPicks = []; // reset winning picks if scores are not in order
                    //break; // stop if the score is different
                }
            }

            break;
        default:
            showLeaderboard = false;
            console.warn(`Unexpected game status: ${gameWeek.status}`);
            break;
    }

    return (
        <div>
            <PageHeader >
                <PageHeaderHeading >
                    {title}
                </PageHeaderHeading>
                <PageHeaderDescription>
                    <span className='ml-2 text-sm text-muted-foreground'> Saturday, {getSaturdayOfGameWeek(gameWeek)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </PageHeaderDescription>
                {gameWeek.num_selections > 0 &&
                    <p className="text-med font-light text-accent-foreground">
                        Correctly Pick {gameWeek.num_selections} Spreads to Win the Pot!
                    </p>
                }
                <br />
                Game Status: {gameStateToString(gameWeek.status as GameStates)}
                <br />
                <span className="text-med text-primary">Current Pot: ${gameWeek.purse_amount.toFixed(0)} </span>
                {/* {gameWeek.status === GameStates.FINISHED && winningPicks.length > 0 && winningPicks.map((pick, index) => (
                    pick._id && <CardWinningPick key={index} pickId={pick._id} />
                ))} */}
                {/* <GameDetails game={gameWeek} races={races} /> */}
                <PageActions>
                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && <BtnChangeGameWeekState game={gameWeek as GameWeekClientType} />}
                        {isAdmin && showUpdateScoresBtn && <ButtonUpdateGameWeekLeaderboard gameWeekId={gameWeekId} />}
                        {showMakePicksBtn &&
                            <LinkButton
                                href={getLinks().getMakePicksUrl()}>
                                Make Picks
                            </LinkButton>
                        }
             
                        {isAdmin && <ServerActionButton label="Send Report" serverAction={sendReport} />}
                     
                    </div>
                </PageActions>
            </PageHeader>
            <div className="flex flex-1 flex-col pb-6">
                <div className="theme-container container flex flex-1 flex-col gap-10">


                    {/* {!showLeaderboard &&
                        <TabCard
                            cardTitle="Picks"
                            cardDescription="These are the picks for this game."
                            items={picks}
                            filterableOptions={filterableOptionsPicks}
                            ComponentDiv={PeekDiv}
                        />
                    } */}
                    {showLeaderboard &&
                        <Card>
                            <CardHeader className='text-center font-bold text-lg' >
                                Leaderboard
                            </CardHeader>
                            <CardContent>
                                {picks &&
                                    <Suspense fallback={<PickLeaderboardSkeleton />}>
                                        <TableSpreadPickLeaderboard picks={picks} matchups={matchups} gameStatus={gameWeek.status as GameStates} />
                                    </Suspense>
                                }
                            </CardContent>
                        </Card>
                    }

                </div>
            </div>
        </div>
    );
}