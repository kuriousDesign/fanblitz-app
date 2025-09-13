
import { getPick, getGame, getDriver, getRacersByRaceId } from "@/actions/getActions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DriverClientType } from "@/models/reference/Driver";
import { numberToOrdinal } from "@/utils/helpers";


export default async function CardWinningPick({ pickId }: { pickId: string }) {

    const pick = await getPick(pickId);
    //const player = await getPlayer(pick.player_id);
    const game = await getGame(pick.game_id);
    const AmainRacers = await getRacersByRaceId(game.races[0]); //
    //const hardChargerDriverNames = pick.hard_chargers.map((hc:DriverPredictionClientType) => hc.driver_id).join(", ");
    // i want to be able print the driverprediction in a list down below with the driver name and the prediction for hard chargers
    const hardChargerDrivers : DriverClientType[] = [];
    
    for (const hc of pick.hard_chargers) {
        const driver = await getDriver(hc.driver_id);
        if (driver) {
            hardChargerDrivers.push(driver);
        }
    }

    const topDriverDrivers : DriverClientType[] = [];
    const topDriverPositions: number[] = [];
    // i want to be able print the driverprediction in a list down below with the driver
    for (const tf of pick.top_finishers) {
        const driver = await getDriver(tf.driver_id);
        // find driver id in the AmainRacers
        const racer = AmainRacers.find(r => r.driver_id === tf.driver_id);
        topDriverPositions.push(racer?.current_position || 0); // get the position of the
        if (driver) {
            topDriverDrivers.push(driver);
        }
    }

    return (
        <Card className="shadow-primary/50 border-1 border-primary">
            <CardHeader>
                <CardTitle>Winning Pick</CardTitle>
                <CardDescription className="font-semibold text-primary">
                    Congrats to {pick.name} for winning the ${game.purse_amount} pot!
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                {pick.hard_chargers.length > 0 &&
                    <>
                        <h2 className="text-med font-semibold">Hard Chargers</h2>

                        <ul className="list-disc pl-5">
                            {pick.hard_chargers.map((hc, index) => (
                                <li key={index} className="text-sm text-secondary-foreground">
                                    {hardChargerDrivers[index].first_name} {hardChargerDrivers[index].last_name} - {hc.prediction} cars predicted - {hc.score}pts
                                </li>
                            ))}
                        </ul>
                    </>
                }
                {pick.top_finishers.length > 0 &&
                    <>
                        <h2 className="text-med font-semibold">Top Finishers</h2>
                        <ul className="list-decimal pl-5">
                            {pick.top_finishers.map((tf, index) => (
                                <li key={index} className="text-sm text-secondary-foreground">
                                    {topDriverDrivers[index].first_name} {topDriverDrivers[index].last_name} - actual position: {numberToOrdinal(topDriverPositions[index])} - {tf.score}pts
                                </li>
                            ))}
                        </ul>
                    </>
                }
            </CardContent>
        </Card>
    );
};