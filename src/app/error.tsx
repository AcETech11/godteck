"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global boundary caught runtime error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-4 max-w-md mx-auto">
        <div className="inline-flex p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 mb-2 animate-bounce">
          <AlertOctagon className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Something went wrong!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          An unexpected error occurred while rendering this page. Our technical team has been notified.
        </p>
        <div className="pt-4">
          <Button
            size="lg"
            variant="default"
            onClick={() => reset()}
            className="w-full sm:w-auto font-semibold gap-2 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
