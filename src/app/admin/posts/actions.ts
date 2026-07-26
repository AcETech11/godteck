"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendPostStatusNotification } from "@/lib/email/notifications"

export interface ActionResponse {
  success: boolean
  error?: string
}

/**
 * Helper to verify that the current user is an authenticated admin.
 */
async function checkIsAdmin(): Promise<boolean> {
  try {
    const session = await auth()
    const userId = session?.userId

    if (!userId) {
      return false
    }

    // 1. Check Clerk publicMetadata or metadata
    const publicMetadata = session.sessionClaims?.publicMetadata as { role?: string } | undefined
    const metadata = (session.sessionClaims as any)?.metadata as { role?: string } | undefined
    const clerkRole = publicMetadata?.role || metadata?.role

    if (clerkRole === "admin") {
      return true
    }

    // 2. Fallback check via Supabase profiles table
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    return profile?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Approves a pending post, updates status to 'approved'
 */
export async function approvePost(
  postId: string,
  authorEmail: string,
  postTitle: string
): Promise<ActionResponse> {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return { success: false, error: "Unauthorized. Admin role required." }
    }

    if (!postId) {
      return { success: false, error: "Post ID is required." }
    }

    const supabase = createAdminClient()

    // Update status to 'approved'
    const { error: updateError } = await supabase
      .from("posts")
      .update({ status: "approved" })
      .eq("id", postId)

    if (updateError) {
      return { success: false, error: updateError.message || "Failed to update status." }
    }

    // Call sendPostStatusNotification resiliently
    try {
      const emailRes = await sendPostStatusNotification({
        userEmail: authorEmail,
        postTitle,
        status: "approved",
      })
      if (!emailRes.success) {
        console.error("Failed to send post status notification email:", emailRes.error)
      }
    } catch (emailErr) {
      console.error("An unexpected error occurred while sending approval notification email:", emailErr)
    }

    // Revalidate paths
    revalidatePath("/admin/posts")
    revalidatePath("/")

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." }
  }
}

/**
 * Rejects a pending post, updates status to 'rejected' and saves rejection reason
 */
export async function rejectPost(
  postId: string,
  authorEmail: string,
  postTitle: string,
  reason: string
): Promise<ActionResponse> {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return { success: false, error: "Unauthorized. Admin role required." }
    }

    if (!postId) {
      return { success: false, error: "Post ID is required." }
    }

    const supabase = createAdminClient()

    // Update status to 'rejected' and save rejection reason
    const { error: updateError } = await supabase
      .from("posts")
      .update({ status: "rejected", rejection_reason: reason || null })
      .eq("id", postId)

    if (updateError) {
      return { success: false, error: updateError.message || "Failed to reject post." }
    }

    // Call sendPostStatusNotification resiliently
    try {
      const emailRes = await sendPostStatusNotification({
        userEmail: authorEmail,
        postTitle,
        status: "rejected",
        rejectionReason: reason,
      })
      if (!emailRes.success) {
        console.error("Failed to send post status notification email:", emailRes.error)
      }
    } catch (emailErr) {
      console.error("An unexpected error occurred while sending rejection notification email:", emailErr)
    }

    // Revalidate paths
    revalidatePath("/admin/posts")
    revalidatePath("/")

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." }
  }
}
