import { RaceClientType } from "@/models/reference/Race";
import { RacerClientType } from "@/models/reference/Racer";
import { getRace, getRacersWithDriversByRaceId } from "@/actions/getActions";
import { DriverClientType } from "@/models/reference/Driver";
import { getLinks } from "@/lib/link-urls";
import { LinkButton } from "@/components/LinkButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { getIsAdmin } from "@/actions/userActions";

export default async function CardRacers({ eventId, raceId }: { eventId: string, raceId: string }) {

    let racersTitle = 'Starting Lineup';


    // Replace with your actual API endpoint
    const race = await getRace(raceId) as RaceClientType;
    const racerDrivers = await getRacersWithDriversByRaceId(raceId as string);
    const isAdmin = await getIsAdmin();


    //console.log("status:", raceResult.status);
    if (!racerDrivers || racerDrivers.length === 0) {
        racersTitle = 'No Racers';
    }
    else if (race.status === 'finished' || race.status === 'in_progress') {
        //racerDrivers.sort((racer.a, racer.b) => a.current_position - b.current_position);
        racersTitle = 'Current Standings';
        if (race.status === 'finished') {
            racersTitle = 'Final Results';
        }
    }
    else {
        //racers.sort((a, b) => a.starting_position - b.starting_position);
        racerDrivers.sort((a, b) => a.racer.starting_position - b.racer.starting_position);
    }

    const racers = racerDrivers.map(rd => rd.racer) as RacerClientType[];
    const drivers = racerDrivers.map(rd => rd.driver) as DriverClientType[];

    if (!racerDrivers || !race) return <div>Race not found</div>;

    function getDriverFullName(driverId: string): string {
        //console.log("getDriverFullName called with driver_id:", driver_id);
        const driver = drivers?.find(d => d._id ? d._id.toString() === driverId : false);
        return driver ? `${driver.first_name} ${driver.last_name} ${driver.suffix}` : 'Unknown Driver';
    }
    function getDriverCarNumber(driverId: string): string {

        //console.log("getDriverCarNumber called with driver_id:", driverId);
        //console.log("drivers:", drivers);
        const driver = drivers?.find(d => d._id ? d._id.toString() === driverId : false);

        if (driver) {
            //console.log(`Found driver: ${driver.first_name} ${driver.last_name}, Car Number: ${driver.car_number}`);
            return driver.car_number;
        }
        return 'Unknown Car Number';
    }


    const RacersDiv = () => {
        return (
            <div className="grid grid-cols-1 gap-2 space-x-2 w-fit">
                {racers.map((racer: RacerClientType) => (
                    <div
                        key={racer._id}
                        className="p-2 rounded flex flex-row w-fit space-x-4 items-center"

                    >
                        {race?.status.startsWith('lineup') && (
                            <div className="flex font-medium justify-center rounded-full bg-accent w-8 h-8 text-center items-center">{racer.starting_position}</div>
                        )}
                        <p className="font-bold">{getDriverFullName(racer.driver_id.toString())}</p>
                        <p className="">#{drivers ? getDriverCarNumber(racer.driver_id.toString()) : ''}</p>


                        {race?.status === 'finished' && (
                            <>
                                <p className="font-medium">{racer.current_position} Place</p>
                                <p className="font-medium">Cars Passed: {racer.starting_position - racer.current_position}</p>
                            </>
                        )}
                        {race?.status === 'in_progress' && (
                            <p className="font-medium">Current Position: {racer.current_position}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{racersTitle}</CardTitle>
                <CardDescription>
                    drivers that are racing in this race
                </CardDescription>
                {isAdmin &&
                    <LinkButton
                        href={getLinks().getCreateRacerUrl(eventId, raceId)}
                    >
                        Edit Lineup
                    </LinkButton>}
            </CardHeader>
            <CardContent className="grid gap-6">
                <RacersDiv />
            </CardContent>
        </Card>
    );
};