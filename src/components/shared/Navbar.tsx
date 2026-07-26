"use client";

import Link from "next/link";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";

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
                {/* Mobile links */}
                <div className="md:hidden flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Admin
                    </Link>
                  )}
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
