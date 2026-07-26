export const dynamic = "force-dynamic"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Plus,
  FileText,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Mail,
  Shield,
  ArrowRight,
  Info
} from "lucide-react"

// Types mapping matching our database schema
import { Profile, Post } from "@/types/database"

export default async function MemberDashboardPage() {
  const session = await auth()
  const userId = session?.userId

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = createAdminClient()

  // 1. Fetch member profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  const profile = profileData as Profile | null

  // 2. Fetch member posts sorted by created_at descending
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })

  const posts = (postsData || []) as Post[]

  // Handle errors or missing profile gracefully by using fallback data
  const email = profile?.email || "No Email Provided"
  const fullName = profile?.full_name || "Valued Member"
  const avatarUrl = profile?.avatar_url || ""
  const role = profile?.role || "member"
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Joined"

  // Initials for avatar fallback
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "M"

  // Helper function to render status badges
  function renderStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-medium">
            In Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-medium">
            Published
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-medium">
            Rejected
          </Badge>
        )
      case "flagged":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 font-medium">
            Needs Attention
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="capitalize">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* 1. Header/Profile Summary Section */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-zinc-100 dark:ring-zinc-800"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xl sm:text-2xl flex items-center justify-center ring-4 ring-zinc-50 dark:ring-zinc-900">
                {initials}
              </div>
            )}

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {fullName}
                </h1>
                <Badge
                  variant={role === "admin" ? "default" : "secondary"}
                  className="capitalize font-semibold text-xs tracking-wider"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {role}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {email}
                </span>
                <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Create New Post CTA */}
          <div className="shrink-0">
            <Link href="/dashboard/posts/new">
              <Button className="w-full sm:w-auto font-semibold gap-2 shadow-sm">
                <Plus className="w-5 h-5" />
                Create New Post
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. User Post Tracking Feed Section */}
      <section className="space-y-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your Submitted Posts
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor the verification progress of your updates, announcements, or inquiries.
          </p>
        </div>

        {postsError && (
          <div className="text-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50">
            <p className="text-rose-700 dark:text-rose-400 font-medium">
              Failed to load your submitted posts. Please refresh or try again later.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!postsError && posts.length === 0 && (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                No posts submitted yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                You haven't submitted any posts yet. Click 'Create New Post' to share your first update or inquiry!
              </p>
            </div>
            <div>
              <Link href="/dashboard/posts/new">
                <Button variant="outline" className="font-semibold gap-2">
                  <Plus className="w-4 h-4" />
                  Submit Your First Post
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Post Grid/List Feed */}
        {!postsError && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-white dark:bg-zinc-900 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 capitalize">
                      {post.category}
                    </span>
                    {renderStatusBadge(post.status)}
                  </div>
                  <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Rejection Reason Feedback */}
                  {post.status === "rejected" && post.rejection_reason && (
                    <div className="rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">Rejection Feedback</span>
                      </div>
                      <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                        {post.rejection_reason}
                      </p>
                    </div>
                  )}
                </CardContent>

                {/* Footer Actions (Only for approved posts) */}
                {post.status === "approved" && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <Link
                      href={`/p/${post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      View Live Post
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
