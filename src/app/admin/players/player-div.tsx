"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PlayerClientType } from "@/models/Player"



export default function PlayerDiv({ data }: { data: PlayerClientType }) {
  //const player = players.find(player => player._id === data.player_id);

  //const isPickOwner = player?._id === data.player_id;
  return (
    <div className="flex flex-row items-center justify-start py-1 gap-4 rounded-lg">
     
      <Avatar className='size-6'>
        {/* <AvatarImage src={data.driver?.image || ''} alt={data.driver?.name || 'Driver Avatar'} /> */}
        <AvatarFallback className='bg-accent flex size-6 items-center justify-center text-xs'>
          {data?.name?.charAt(0) || ''}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-row items-start space-x-4">
        <div className="text-sm">{`${data.name}`}</div>
        <Separator orientation="vertical" />
        <div className="text-secondary-foreground font-light text-sm">{`${data.role}`}</div>
        <Separator orientation="vertical" />
        <div className="text-secondary-foreground font-light text-sm">{`${data.email}`}</div>
        {/* {!data.is_paid && data._id && <VenmoLink pickId={data._id} amount={game.entry_fee} />} */}

      </div>
    
    </div>
  )
}
