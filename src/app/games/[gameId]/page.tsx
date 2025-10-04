export const experimental_ppr = true;

import { Suspense } from 'react';

import { getCurrentPlayer, getDriver, getEvent, getGame, getHardChargerTable, getPicksByGameId, getRace, getRacersByRaceId } from '@/actions/getActions';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { GameDetails } from '@/components/forms/pick-form/game-details';

import {
	PageActions,
	PageHeader,
	PageHeaderDescription,
	PageHeaderHeading,
} from "@/components/page-header"
import { LinkButton } from "@/components/LinkButton"
import { getLinks } from "@/lib/link-urls"
import ButtonUpdateGame from '../../../components/button-update-game';
import { getIsAdmin } from '@/actions/userActions';
import TableHardChargerLeaderboard from '@/components/tables/hard-charger-leaderboard';

import TabCard, { FilterOption } from '@/components/cards/tab-card';
import PeekDiv from '@/components/cards/pick-div';
import { GameStates, gameStateToString } from '@/types/enums';

import { GameClientType } from '@/models/reference/Game';
import BtnChangeGameState from '../../../components/button-change-game-state';
import { RaceClientType } from '@/models/reference/Race';
import TablePickLeaderboard, { PickLeaderboardSkeleton } from '@/components/tables/pick-leaderboard';
import { updateGamePot, updatePicksScoresByGame } from '@/actions/scoreActions';

import VenmoLink from '@/components/VenmoLink';
import CardWinningPick from '@/components/card-winning-pick';
import { PickClientType } from '@/models/reference/Pick';
import { RacerClientType } from '@/models/reference/Racer';
import { DriverClientType } from '@/models/reference/Driver';

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
	const playerPromise = getCurrentPlayer();
	const isAdminPromise = getIsAdmin();
	const { gameId } = await params;
	updatePicksScoresByGame(gameId, true); // This function is assumed to update the scores of picks for the game
	updateGamePot(gameId); // This function is assumed to update the game pot
	const picksPromise = getPicksByGameId(gameId);
	const hardChargerTablePromise = getHardChargerTable(gameId);

	const game = await getGame(gameId);
	if (!game) {
		return <div>Game not found</div>;
	}
	//const races = await getRacesByGameId(gameId);
	const raceIds = game?.races || [];
	const racesPromise = Promise.all(
		raceIds.map(async (raceId: string) => {
			return getRace(raceId);
		})
	);
	const eventPromise = getEvent(game.event_id);

	const [event, player, races, isAdmin, hardChargerTable, picks] = await Promise.all([
		eventPromise,
		playerPromise,
		racesPromise,
		isAdminPromise,
		hardChargerTablePromise,
		picksPromise,
	]);

	let winningPicks: PickClientType[] = [];
	//get all racers for a main race using for loop search for race.letter === 'A'
	let aMainRacers: RacerClientType[] = [];
	const aMainDrivers: DriverClientType[] = [];

	for (const race of races) {
		if (race.letter === 'A') {
			aMainRacers = await getRacersByRaceId(race._id as string);
			// Assuming aMainRacers has driver_id, we can fetch drivers
			for (const racer of aMainRacers) {
				const driver: DriverClientType = await getDriver(racer.driver_id);
				if (driver) {
					aMainDrivers.push(driver);
				}
			}
			break;
		}
	}




	// Define filterable options
	const filterableOptionsPicks = [
		{ key: "player_id", value: null, tabLabel: 'All' }, // "All" tab
		{ key: "player_id", value: player?._id, tabLabel: 'Yours' }, // "My Picks" tab
	] as FilterOption[];

	const title = game.name
	const description = event.name

	// i need a switch case statement to handle showing the picks leaderboard vs picks card, based on game.status
	let showLeaderboard = false;
	let showVenmoLink = false;
	switch (game.status) {
		case GameStates.OPEN:
			showLeaderboard = false;
			showVenmoLink = true;
			break;
		case GameStates.IN_PLAY:
			showLeaderboard = true;
			showVenmoLink = true;
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
					console.error('Picks are not sorted by score_total in descending order');
					winningPicks = []; // reset winning picks if scores are not in order
					break; // stop if the score is different
				}
			}

			break;
		default:
			showLeaderboard = false;
			console.warn(`Unexpected game status: ${game.status}`);
			break;
	}

	return (
		<div>
			<PageHeader >
				<PageHeaderHeading >
					{title}
				</PageHeaderHeading>
				<PageHeaderDescription>{description}</PageHeaderDescription>
				<p className="text-med font-semibold text-accent-foreground">
					${game.entry_fee.toFixed(2)} Entry
				</p>
				{game.num_hard_chargers > 0 &&
					<p className="text-med font-light text-accent-foreground">
						Choose {game.num_hard_chargers} Hard Chargers
					</p>
				}
				{game.num_top_finishers > 0 &&
					<p className="text-med font-light text-accent-foreground">
						Choose {game.num_top_finishers} Top Finishers	
					</p>
				}
				<br />
				Game Status: {gameStateToString(game.status as GameStates)}
				<br />
				<span className="text-med text-primary">Current Pot: ${game.purse_amount.toFixed(2)} </span>
				{game.status === GameStates.FINISHED && winningPicks.length > 0 && winningPicks.map((pick, index) => (
					pick._id && <CardWinningPick key={index} pickId={pick._id} />
				))}
				<GameDetails game={game} races={races} />
				<PageActions>
					<div className="flex flex-wrap items-center gap-2">
						{game.status === GameStates.OPEN &&
							<LinkButton
								href={getLinks().getCreatePickUrl(gameId)}
							>
								Make a Pick
							</LinkButton>
						}
						{(true || game.status === GameStates.IN_PLAY) && isAdmin && <ButtonUpdateGame gameId={gameId} />}
						{isAdmin && <BtnChangeGameState state={GameStates.OPEN} game={game as GameClientType} />}
						{isAdmin && <BtnChangeGameState game={game as GameClientType} />}
						{isAdmin && races.map((race: RaceClientType) => (
							<LinkButton
								key={race._id}
								href={getLinks().getUpdateRaceStandingsUrl(gameId, race._id as string)}
							>
								Adjust {race.letter} {race.type} Standings
							</LinkButton>
						))}
						{showVenmoLink && <VenmoLink amount={game.entry_fee} pickId="replaceWithYourPickId" />}
					</div>
				</PageActions>
			</PageHeader>
			<div className="flex flex-1 flex-col pb-6">
				<div className="theme-container container flex flex-1 flex-col gap-10">


					{!showLeaderboard &&
						<TabCard
							cardTitle="Picks"
							cardDescription="These are the picks for this game."
							items={picks}
							filterableOptions={filterableOptionsPicks}
							ComponentDiv={PeekDiv}
						/>
					}
					{showLeaderboard &&
						<Card>
							<CardHeader >
								Leaderboard
							</CardHeader>
							<CardDescription >
								See how each pick is doing in this game.
							</CardDescription>
							<CardContent>
								{picks && hardChargerTable &&
									<Suspense fallback={<PickLeaderboardSkeleton />}>
										<TablePickLeaderboard game={game as GameClientType} picks={picks} aMainRacers={aMainRacers} hardChargerTable={hardChargerTable} aMainDrivers={aMainDrivers} />
									</Suspense>
								}
							</CardContent>
						</Card>
					}
					{/* Hard Chargers Leaderboard */}
					{showLeaderboard &&
						<Card>
							<CardHeader >
								Hard Chargers
							</CardHeader>
							<CardDescription >

								These are the drivers who passed the most cars for this game.

							</CardDescription>
							<CardContent>
								{hardChargerTable &&
									<TableHardChargerLeaderboard table={hardChargerTable} />
								}
							</CardContent>
						</Card>
					}
				</div>
			</div>
		</div>
	);
}