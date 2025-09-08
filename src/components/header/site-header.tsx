"use client"

import Link from "next/link"
import { siteConfig } from "@/lib/config"
import { fontOrbitron } from "@/lib/fonts"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/header/main-nav"
import { MobileNav } from "@/components/header/mobile-nav"
//import { ModeSwitcher } from "@/components/header/mode-switcher"
import { Button } from "@/components/ui/button"
//import { Separator } from "@/components/ui/separator"
import { LinkButton } from "../LinkButton"
import TiltedBox from "./tilted-box"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { useGetUser } from "@/hooks/use-get-user"

export function SiteHeader() {
  const { user, isLoggedIn } = useGetUser();

  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
          <MobileNav

            items={siteConfig.navItems}
            adminItems={siteConfig.adminNavItems}
            className="flex lg:hidden"
          />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
          >
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{'jake'}</span>
            </Link>
          </Button>
          <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-0 h-10">
              <TiltedBox width="4" />
              <div className="w-2 h-10 bg-transparent">{" "}  </div>

              <TiltedBox width="2" />
              <LinkButton
                href="/dashboard"
                variant="link"
                className={`flex h-8 items-center text-lg text-secondary-foreground font-bold leading-none ${fontOrbitron.className}`}
              >
                FanBlitz
              </LinkButton>
              <TiltedBox width="4" />
              <div className="w-[8px] h-10 bg-transparent">{" "}  </div>
              <TiltedBox width="2" />
              <div className="w-[8px] h-10 bg-transparent">{" "}  </div>
              <TiltedBox width="1" />
            </div>
            {/* <Separator orientation="vertical" className="ml-2 hidden lg:block" />
            <Separator orientation="vertical" className="3xl:flex hidden" />

            <ModeSwitcher /> */}
            {/* {isLoggedIn && <Separator orientation="vertical" /> } */}
            {isLoggedIn && 
              <Avatar className="h-8 w-8">
         
              <AvatarFallback>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
              </Avatar>
            }
          </div>
        </div>
      </div>
    </header>
  )
}
