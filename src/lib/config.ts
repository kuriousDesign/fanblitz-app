import { getLinks } from "./link-urls"

export const siteConfig = {
  name: "fanblitz/ui",
  url: "https://ui.shadcn.com",
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "a pick 'em game that makes watching spring car racing even more thrilling.",
  links: {
    twitter: "https://twitter.com/shadcn",
    kurious: "https://kurious-design.com",
    github: "https://github.com/kuriousDesign/fanblitz-app",
  },
  navItems: [
    {
      href: getLinks().getGamesUrl(),
      label: "Games",
    },
    {
      href: getLinks().getPlayerPicksUrl(),
      label: "Picks",
    },
    {
      href: "https://kurious-design.com",
      label: "Kurious",
    },

  ],
  adminNavItems: [
  { href: getLinks().getEventsUrl(), label: 'Events' },
   { href: getLinks().getCreateEventUrl(), label: 'Create Event' },
  //{ href: getLinks().getUsersUrl(), label: 'Users' },
  { href: getLinks().getDriversUrl(), label: 'Drivers' },
]
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}
