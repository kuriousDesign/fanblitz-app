import { IoMdAddCircle } from "react-icons/io";
import { LinkButton } from "@/components/LinkButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { GameClientType } from "@/models/reference/Game"
import { getLinks } from "@/lib/link-urls";
import GameDiv from "./game-div";

export async function CardsGames({ games, filterLabel, showCreateButton, eventId }: { games: GameClientType[], filterLabel?: string, showCreateButton?: boolean, eventId?: string }) {

  if (!games || games.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{filterLabel || ''} Games</CardTitle>
          <CardDescription>
            <p className="pb-4">
              There are no games available at the moment.
            </p>
            {showCreateButton && eventId &&
              <LinkButton
                className="w-fit text-primary-foreground"
                href={getLinks().getCreateGameUrl(eventId)} >
                <IoMdAddCircle />
                Create Game
              </LinkButton>

            }

          </CardDescription>

        </CardHeader>
      </Card>
    )
  }

  let cardDescription = ''
  let cardTitle = 'Games';

  if (filterLabel) {
    let filterStatuses = [] as string[];
    if (filterLabel.toLowerCase() === 'available') {
      filterStatuses = ['open', 'regisration_over', 'active',];
      games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'make picks on these games.';
      cardTitle = 'Available Games';
    } else if (filterLabel.toLowerCase() === 'past') {
      filterStatuses = ['just_finished', 'completed', 'cancelled'];
      games = games.filter((game) => filterStatuses.includes(game.status));
      cardDescription = 'Completed games that you can review.';
      cardTitle = 'Past Games';
    } else if (filterLabel.toLowerCase() === 'upcoming') {
      filterStatuses = ['created'];
      games = games.filter((game) => filterStatuses.includes(game.status));
      cardTitle = 'Upcoming Games';
      cardDescription = 'All games active or you have played.';
    } else if (filterLabel.toLowerCase() === 'all') {
      cardDescription = 'All games active or you have played.';
      cardTitle = 'All Games';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle> {cardTitle}</CardTitle>
        <CardDescription>
          {cardDescription}
        </CardDescription>
        {showCreateButton && eventId &&
          <LinkButton
            className="w-fit "
            href={getLinks().getCreateGameUrl(eventId)} >
            <IoMdAddCircle />
            Create Game
          </LinkButton>
        }

      </CardHeader>

      <CardContent className="grid gap-6">
        {games.map((game: GameClientType) => (
          <GameDiv key={game._id} data={game}/>
        ))}
      </CardContent>
    </Card>
  )
}
