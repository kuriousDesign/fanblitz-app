import { Metadata } from "next"
import Link from "next/link"


import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"

const title = "Pick a Color. Make it yours."
const description =
  "Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon."

export const metadata: Metadata = {
  title,
  description,
}

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <PageHeader>
       
        <PageHeaderHeading>{title}</PageHeaderHeading>
        <PageHeaderDescription>{description}</PageHeaderDescription>
        <PageActions>
          <Button asChild size="sm">
            <a href="#themes">Browse Themes</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/docs/theming">Documentation</Link>
          </Button>
        </PageActions>
      </PageHeader>
      {children}
    </div>
  )
}
