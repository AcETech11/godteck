export const dynamic = "force-dynamic"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { WaitlistManager } from "./WaitlistManager"
import { Users, Hourglass, CheckCircle2, XCircle } from "lucide-react"

export default async function AdminWaitlistPage() {
  const session = await auth()
  const userId = session?.userId

  if (!userId) {
    redirect("/sign-in")
  }

  // 1. Check Clerk publicMetadata or metadata
  const publicMetadata = session.sessionClaims?.publicMetadata as { role?: string } | undefined
  const metadata = (session.sessionClaims as any)?.metadata as { role?: string } | undefined
  const clerkRole = publicMetadata?.role || metadata?.role

  let isAdmin = clerkRole === "admin"

  const supabase = createAdminClient()

  if (!isAdmin) {
    // 2. Fallback check via Supabase profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    isAdmin = profile?.role === "admin"
  }

  // If not admin, redirect to /dashboard
  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch waitlist submissions sorted by created_at descending
  const { data: entries, error } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching waitlist submissions:", error)
  }

  const waitlistEntries = entries || []

  // Count stats
  const totalSubmissions = waitlistEntries.length
  const pendingCount = waitlistEntries.filter((e) => e.status === "pending").length
  const approvedCount = waitlistEntries.filter((e) => e.status === "approved").length
  const rejectedCount = waitlistEntries.filter((e) => e.status === "rejected").length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Waitlist Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review, approve, and reject user applications to join the GodTeck platform.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Submissions */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{totalSubmissions}</p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
            <Hourglass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{approvedCount}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table & Filter Area */}
      <WaitlistManager initialEntries={waitlistEntries} />
    </div>
  )
}
