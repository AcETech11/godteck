"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWaitlistInviteEmail } from "@/lib/email/notifications"
import { revalidatePath } from "next/cache"

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
 * Approves a pending waitlist user, updates status to 'approved', and sends an invitation email.
 */
export async function approveWaitlistUser(waitlistId: string): Promise<ActionResponse> {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return { success: false, error: "Unauthorized. Admin role required." }
    }

    if (!waitlistId) {
      return { success: false, error: "Waitlist ID is required." }
    }

    const supabase = createAdminClient()

    // Retrieve the waitlist entry
    const { data: entry, error: fetchError } = await supabase
      .from("waitlist")
      .select("email, full_name")
      .eq("id", waitlistId)
      .single()

    if (fetchError || !entry) {
      return { success: false, error: fetchError?.message || "Waitlist entry not found." }
    }

    // Update status to 'approved'
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ status: "approved" })
      .eq("id", waitlistId)

    if (updateError) {
      return { success: false, error: updateError.message || "Failed to update status." }
    }

    // Send invitation email
    const emailResult = await sendWaitlistInviteEmail({
      userEmail: entry.email,
      userName: entry.full_name || "Valued Guest",
    })

    // Revalidate waitlist dashboard page
    revalidatePath("/admin/waitlist")

    if (!emailResult.success) {
      return {
        success: true,
        error: `User was approved, but the email invitation failed: ${emailResult.error || "Unknown email error"}`,
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." }
  }
}

/**
 * Rejects a waitlist user, updating their status to 'rejected'.
 */
export async function rejectWaitlistUser(waitlistId: string): Promise<ActionResponse> {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return { success: false, error: "Unauthorized. Admin role required." }
    }

    if (!waitlistId) {
      return { success: false, error: "Waitlist ID is required." }
    }

    const supabase = createAdminClient()

    // Update status to 'rejected'
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ status: "rejected" })
      .eq("id", waitlistId)

    if (updateError) {
      return { success: false, error: updateError.message || "Failed to reject user." }
    }

    // Revalidate waitlist dashboard page
    revalidatePath("/admin/waitlist")

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred." }
  }
}
