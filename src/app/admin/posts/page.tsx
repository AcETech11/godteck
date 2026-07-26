export const dynamic = "force-dynamic"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { PostModerationClient, PostWithAuthor } from "./PostModerationClient"
import { FileText, Shield, Sparkles } from "lucide-react"

export default async function AdminPostsModerationPage() {
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

  const adminSupabase = createAdminClient()

  if (!isAdmin) {
    // 2. Fallback check via Supabase profiles table
    const { data: profile } = await adminSupabase
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

  // Fetch pending posts joined with profile data using Supabase server client
  const supabase = await createClient()
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      author_id,
      title,
      content,
      category,
      image_url,
      status,
      rejection_reason,
      created_at,
      updated_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true }) // oldest first

  if (postsError) {
    console.error("Error fetching pending posts:", postsError)
  }

  const pendingPosts = (postsData || []) as unknown as PostWithAuthor[]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Post Moderation Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full">
              <Shield className="h-3 w-3" />
              Admin Access Only
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Review, read, and moderate all pending user post submissions to ensure quality and guidelines adherence.
          </p>
        </div>
      </div>

      {postsError ? (
        <div className="text-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50">
          <p className="text-rose-700 dark:text-rose-400 font-medium">
            Failed to load pending posts. Please try refreshing or checking back later.
          </p>
        </div>
      ) : (
        <PostModerationClient initialPosts={pendingPosts} />
      )}
    </div>
  )
}
