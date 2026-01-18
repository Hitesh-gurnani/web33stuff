"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { navMain } from "@/components/util/nav-util";

interface NavInfo {
  parentTitle: string;
  currentTitle: string;
  parentUrl: string;
}

function getNavInfo(pathname: string): NavInfo | null {
  // Handle dashboard root
  if (pathname === "/dashboard") {
    return {
      parentTitle: "Dashboard",
      currentTitle: "Overview",
      parentUrl: "/dashboard",
    };
  }

  // Search through navMain structure
  for (const navItem of navMain) {
    // Check if current path matches any sub-item
    const matchingSubItem = navItem.items?.find(
      (item: { url: string }) => item.url === pathname
    );

    if (matchingSubItem) {
      return {
        parentTitle: navItem.title,
        currentTitle: matchingSubItem.title,
        parentUrl: navItem.url,
      };
    }

    // Check if current path matches the parent item
    if (navItem.url === pathname && navItem.url !== "#") {
      return {
        parentTitle: "Dashboard",
        currentTitle: navItem.title,
        parentUrl: "/dashboard",
      };
    }
  }

  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navInfo = getNavInfo(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/50 dark:border-border/30 bg-background/95 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {navInfo && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/dashboard"
                      className="font-[family-name:var(--font-play)]"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  {navInfo.parentTitle !== "Dashboard" && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink
                          href={navInfo.parentUrl}
                          className="font-[family-name:var(--font-play)]"
                        >
                          {navInfo.parentTitle}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-[family-name:var(--font-play)] font-semibold">
                      {navInfo.currentTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>

        {/* Page Heading */}
        {navInfo && (
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-background dark:via-background/95 dark:to-card/50 border-b border-border/50 dark:border-border/30">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-[family-name:var(--font-play)] bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                {navInfo.currentTitle}
              </h1>
              {/* <p className="text-sm text-muted-foreground font-[family-name:var(--font-play)]">
                {navInfo.parentTitle !== "Dashboard" && (
                  <span>{navInfo.parentTitle} / </span>
                )}
                {navInfo.currentTitle}
              </p> */}
            </div>
          </div>
        )}

        <main className="w-full h-full bg-background dark:bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
