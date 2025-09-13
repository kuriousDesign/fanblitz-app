import {
  Avatar,
  AvatarFallback,
  //AvatarImage,
} from "@/components/ui/avatar"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "../ui/separator"
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
export async function CardPicksGame({
  picks,
  filterLabel, viewType }: {
    picks: PickClientType[],
    filterLabel?: string, viewType?: 'full' | 'peek'
  }) {
  //const router = useRouter();
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
    if (filterLabel.toLowerCase() === 'your') {

      //games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'These are your picks for this game.';
      cardTitle = 'Your Picks';


    } else if (filterLabel.toLowerCase() === 'all') {
      cardDescription = 'All picks active or you have played.';
      cardTitle = 'All Picks';
    }
  }

  const PeekDiv = ({ pick }: { pick: PickClientType }) => {
    //const player = players.find(player => player._id === pick.player_id);
    return (
      <div className="flex flex-row items-center justify-start py-1 gap-4 rounded-lg">
        <Avatar className='size-6'>
          {/* <AvatarImage src={pick.driver?.image || ''} alt={pick.driver?.name || 'Driver Avatar'} /> */}
            <AvatarFallback className='bg-accent flex size-6 items-center justify-center text-xs'>
            {pick?.name?.charAt(0) || ''}
            </AvatarFallback>
        </Avatar>
        <div className="flex flex-row items-start space-x-4">
          <div className="text-sm">{`${pick.nickname}`}</div>
          <div className="text-sm text-muted-foreground">{`|`}</div>
          <div className="text-secondary-foreground font-light text-sm">{`${pick.name}`}</div>
        </div>
      </div>
    )
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
        {viewType === 'peek' && picks.map((pick: PickClientType, index: number) => {
          return (
            <div key={pick._id} className="flex flex-col justify-between">
              <PeekDiv pick={pick} />
              {index !== picks.length - 1 &&
                <Separator orientation="horizontal" className='bg-muted' />
              }
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
