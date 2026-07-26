import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full px-4 text-center">
      <div className="space-y-4 flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Loading Dashboard...
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Retrieving details and posts feed.
          </p>
        </div>
      </div>
    </div>
  );
}
