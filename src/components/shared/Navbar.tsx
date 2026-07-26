"use client";

import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, LayoutDashboard, ShieldAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin";

  // Handle loading state to prevent flash/layout shifts
  const showAuth = isLoaded;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              Godteck
            </span>
          </Link>

          {showAuth && isSignedIn && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showAuth ? (
            !isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Join Waitlist
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Mobile Hamburger Dropdown Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400">
                      <Menu className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 shadow-md">
                      <DropdownMenuItem className="p-0">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem className="p-0">
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            <ShieldAlert className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                            Admin Portal
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Dashboard"
                      labelIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="10" rx="1" />
                          <rect width="7" height="5" x="3" y="14" rx="1" />
                        </svg>
                      }
                      href="/dashboard"
                    />
                    {isAdmin && (
                      <UserButton.Link
                        label="Admin Portal"
                        labelIcon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        }
                        href="/admin"
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )
          ) : (
            // While loading, render a loader placeholder to prevent layout shifts
            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
