import { getLinks } from "./link-urls"

export const siteConfig = {
  name: "fanblitz/ui",
  url: "https://ui.shadcn.com",
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "a college football pick 'em game giving you the chance to win big money if you predict all outcomes correctly.",
  links: {
    twitter: "https://twitter.com/shadcn",
    kurious: "https://kurious-design.com",
    github: "https://github.com/kuriousDesign/fanblitz-app",
  },
  navItems: [
    {
      href: getLinks().getMakePicksUrl(),
      label: "Make Picks",
    },
    {
      href: "https://kurious-design.com",
      label: "Kurious",
    },

  ],
  adminNavItems: [
    { 
      href: getLinks().getSeasonsUrl(), 
      label: 'Seasons' 
    },
    { 
      href: getLinks().getCreateEventUrl(), 
      label: 'Create Event' 
    },
    {
      href: getLinks().getGameWeeksUrl(),
      label: "Weeks",
    },
    { href: getLinks().getPlayersUrl(), label: 'Players' },
    //{ href: getLinks().getDriversUrl(), label: 'Drivers' },
  ]
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}
