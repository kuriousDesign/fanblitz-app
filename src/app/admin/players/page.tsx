import { getPlayers } from "@/actions/getActions"

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"

import TabCard, { FilterOption } from "@/components/cards/tab-card"

import { Roles } from "@/types/enums"
import PlayerDiv from "./player-div"
const title = "Games"
const description = "Browse these games."

export const metadata = {
  title,
  description,
}







export default async function PlayersPage() {
  const playersPromise = getPlayers();

  // Define filterable options for displaying games
  const filterableOptionsGames = [
    { key: "role", value: Roles.ADMIN, tabLabel: 'Admins' }, // "
    { key: "role", value: null, tabLabel: 'All' }, // "All" tab
  ] as FilterOption[];

  const [players] = await Promise.all([playersPromise]);

  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>{title}</PageHeaderHeading>
        <PageHeaderDescription>{description}</PageHeaderDescription>
        <PageActions>
          {/* {isAdmin &&
            <LinkButton href={getLinks().getEventsUrl()} >
              Events
            </LinkButton>
          } */}
        
        </PageActions>
      </PageHeader>
      <div className="container-wrapper section-soft flex flex-1 flex-col pb-6">
        <div className="theme-container container flex flex-1 flex-col gap-4">
          <TabCard
            cardTitle="Players"
            cardDescription="Active users of this app."
            items={players}
            filterableOptions={filterableOptionsGames}
            ComponentDiv={PlayerDiv}
          />
        </div>
      </div>
    </div>

  )
}