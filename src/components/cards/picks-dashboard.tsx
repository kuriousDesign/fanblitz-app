"use client"

import { IoMdAddCircle } from "react-icons/io";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { GameClientType } from "@/models/reference/Game"
import { Separator } from "../ui/separator"
import { useRouter } from "next/navigation"
import { PickClientType } from "@/models/reference/Pick";

  function getCardTitle(filterLabel: string | undefined): string {
    if (!filterLabel) return 'Picks';
    switch (filterLabel.toLowerCase()) {
      case 'active':
        return 'Active Picks';
      case 'past':
        return 'Past Picks';
      case 'upcoming':
        return 'Upcoming Picks';
      case 'all':
        return 'All Picks';
      default:
        return `${filterLabel.charAt(0).toUpperCase() + filterLabel.slice(1)} Picks`;
    }
  }
export function CardsPicks({ picks, games, filterLabel }: { picks: PickClientType[], games: GameClientType[], filterLabel?: string }) {
  const router = useRouter();


  
  if (!picks || picks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getCardTitle(filterLabel)}</CardTitle>
          <CardDescription>
            There are no picks available at the moment.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  let cardDescription = ''

  let cardTitle = '';

  if (filterLabel) {
    let filterStatuses = [] as string[];
    if (filterLabel.toLowerCase() === 'active') {
      filterStatuses = ['open', 'regisration_over', 'active',];
      picks = picks.filter((pick) => {
        const game = games.find((game) => game._id === pick.game_id);
        if (!game) {
          console.warn(`Game with id ${pick.game_id} not found for pick ${pick._id}`);
          return false; // Skip picks with no associated game
        }
        return filterStatuses.includes(game.status);
      });
      //games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'These picks are belong to active games.';
      cardTitle = 'Active Picks';
    } else if (filterLabel.toLowerCase() === 'past') {
      filterStatuses = ['just_finished', 'completed', 'cancelled'];
      games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'Completed picks that you can review.';
      cardTitle = 'Past Picks';
    } else if (filterLabel.toLowerCase() === 'upcoming') {
      filterStatuses = ['created'];
      games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'All picks active or you have played.';
      cardTitle = 'Upcoming Picks';
    } else if (filterLabel.toLowerCase() === 'all') {
      cardDescription = 'All picks active or you have played.';
      cardTitle = 'All Picks';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {cardTitle}
        </CardTitle>
        <CardDescription>
          {cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {picks.map((pick: PickClientType, index:number) => {
          const game = games.find((game) => game._id === pick.game_id);
          if (!game) {
            console.warn(`Game with id ${pick.game_id} not found for pick ${pick._id}`);
            return null; // Skip rendering if game is not found
          }
          return(
          <div key={pick._id}>
            <Button
              className="w-full flex items-center justify-between gap-y-2 hover:bg-muted transition-colors shadow-md p-7 rounded-md z-50"
              onClick={() => { router.push(`/games/${game._id}`) }}
              variant='outline' >
              <div className="flex items-center gap-4 ">
                <Avatar className="border">
                  <AvatarImage src={"/avatars/01.png"} alt="Image" />
                  <AvatarFallback>{game.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm leading-none font-medium">
                    {game.name}
                  </p>
                  <div className="flex h-5 justify-start items-center space-x-3 text-xs text-muted-foreground">
                    <div className='text-primary'>${game.entry_fee} entry</div>
                    <Separator orientation="vertical" />
                    <div>{`$${game.purse_amount.toString()} pot`}</div>
                  </div>
                </div>
              </div>
              {game.status === 'open' &&
                <Button
                  size="sm"

                  className='rounded-l-full rounded-r-full z-100'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent Link click
                    router.push(`/games/${game._id}/create_pick`)
                  }}
                >
                  <IoMdAddCircle />
                  Pick
                </Button>
              }

            </Button>

            {index !== games.length - 1 &&
              <Separator orientation="horizontal" className='bg-muted' />
            }
          </div>
        )}
        )}
      </CardContent>
    </Card>
  )
}
