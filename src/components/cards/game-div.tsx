"use client";
import React from "react";

import { GameClientType } from "@/models/reference/Game";
import { IoMdAddCircle } from "react-icons/io";
import { Gamepad2 } from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    //AvatarImage,
} from "@/components/ui/avatar"
import { LinkButton } from "@/components/LinkButton";

import { Separator } from "../ui/separator"
import { getLinks } from "@/lib/link-urls";

import { Button } from "../ui";
import { postGame } from "@/actions/postActions";
import GameDropdown from "./game-dropdown";


import { useSession } from 'next-auth/react';
import { checkIsAdminByEmail } from "@/lib/utils";
export default function GameDiv({
    data,
    //isAdmin = false
}: {
    data: GameClientType;
    //isAdmin?: boolean;
}) {
    //const isAdmin = useIsAdmin();
     const { data: session } = useSession();
    const email = session?.user?.email;
    let isAdmin = false;
    if (email) {
        isAdmin = checkIsAdminByEmail(email);
    }
     //const isAdmin = useIsAdmin();


    return (
        <div >
            <div
                className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"
            >
                <LinkButton className="flex items-center gap-4 " href={getLinks().getGameUrl(data._id)} variant='ghost'  >
                    <Avatar className="border">
                        {/* <AvatarImage src={"/avatars/01.png"} alt="Image" /> */}
                        <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-sm leading-none font-medium">
                            {data.name}
                        </p>
                        <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                            <div className='text-primary'>${data.entry_fee} entry</div>
                            <Separator orientation="vertical" />
                            <div>{`$${data.purse_amount.toString()} pot`}</div>
                        </div>
                    </div>
                </LinkButton>
                {data.status === 'created' && isAdmin &&
                    <Button
                        variant='secondary'
                        onClick={async() => {
                            data.status = 'open';
                            await postGame(data);
                            // force a reload to see the changes
                            window.location.reload();
                        }}
                    
                    >
                        <Gamepad2 />
                        Open
                    </Button>
                }
                {data.status === 'open' &&
                    <LinkButton
                        size="sm"

                        className='rounded-l-full rounded-r-full z-100'
                        href={getLinks().getCreatePickUrl(data._id as string)}
                    >
                        <IoMdAddCircle />
                        Pick
                    </LinkButton>
                }
                
                <GameDropdown game={data} isAdmin={isAdmin} />

            </div>
        </div>
    );
}