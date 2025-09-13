import { DriverClientType } from "@/models/reference/Driver";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
//import { getDrivers } from "@/actions/driverActions";
import { LinkButton } from "../LinkButton";
import {
    Avatar,
    AvatarFallback,
   // AvatarImage,
} from "@/components/ui/avatar"
import { getLinks } from "@/lib/link-urls";

import { Separator } from "../ui/separator";
import { IoMdAddCircle } from "react-icons/io";
import { getIsAdmin } from "@/actions/userActions";

import { SquarePen } from "lucide-react";
import { getDriverFullName } from "@/types/helpers";
import { getDrivers } from "@/actions/getActions";
import Link from "next/link";
export default async function CardDrivers() {
    const isAdmin = await getIsAdmin();
    const unfilteredDrivers = await getDrivers();
    // filter drivers whose first name begins with Transfer
    const drivers = unfilteredDrivers.filter((driver: DriverClientType) => {
        return driver.first_name && driver.first_name.toLowerCase().indexOf('transfer') === -1;
    });

    // sort drivers by last name, then first name
    drivers.sort((a: DriverClientType, b: DriverClientType) => {
        const lastNameA = a.last_name.toLowerCase();
        const lastNameB = b.last_name.toLowerCase();
        if (lastNameA < lastNameB) return -1;
        if (lastNameA > lastNameB) return 1;
        const firstNameA = a.first_name.toLowerCase();
        const firstNameB = b.first_name.toLowerCase();
        if (firstNameA < firstNameB) return -1;
        if (firstNameA > firstNameB) return 1;
        return 0; // names are equal
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Drivers</CardTitle>
                <CardDescription>
                    Active drivers that you can add to your races
                </CardDescription>
                {isAdmin && <LinkButton href={getLinks().getCreateDriverUrl()} size="lg" className="w-fit text-primary-foreground">
                <IoMdAddCircle />
                    Driver
                </LinkButton>}

            </CardHeader>
            <CardContent className="grid gap-6">
                {drivers?.map((driver: DriverClientType) => (

                    <div key={driver._id}>
                        <Button
                      
                            className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"
                            
                            variant='outline' >
                            <Link 
                                href={getLinks().getDriverUrl(driver._id || '')}
                                className="flex items-center gap-4 ">
                                <Avatar className="border">
                                    {/* <AvatarImage src={"/avatars/01.png"} alt="Image" /> */}
                                    <AvatarFallback>{`${driver.first_name.charAt(0)}${driver.last_name.charAt(0)}`}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5 justify-start ">
                                    <p className="text-sm leading-none font-medium text-left">
                                        {getDriverFullName(driver)}
                                    </p>
                                    <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                                        <div className='text-primary'>{driver.car_number}</div>
                                        <Separator orientation="vertical" />
                                        <div>{`${driver.hometown}`}</div>
                                    </div>
                                </div>
                            </Link>
                            {isAdmin &&
                                <LinkButton
                                    size="sm"
                                    href={getLinks().getEditDriverUrl(driver._id || '')}
                                    variant='ghost'

                                    className='rounded-l-full rounded-r-full z-100'
                                    // onClick={(e) => {
                                    //     e.stopPropagation(); // Prevent Link click
                                    //     //router.push(`/drivers/${driver._id}/create_pick`)
                                    // }}
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
