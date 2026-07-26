import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-4 max-w-md mx-auto">
        <div className="inline-flex p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 mb-2">
          <Compass className="h-12 w-12 animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg">
          Sorry, we couldn&apos;t find the page you are looking for. It might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto font-semibold gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
