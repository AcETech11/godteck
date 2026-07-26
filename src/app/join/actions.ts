"use server"

import { createClient } from "@/lib/supabase/server"
import { WaitlistEntryInsert } from "@/types/database"

export interface WaitlistActionResponse {
  success: boolean
  message: string
}

export async function joinWaitlistAction(
  payload: WaitlistEntryInsert
): Promise<WaitlistActionResponse> {
  // Enforce server-side check/validation constraints again if desired,
  // but Zod handles client-side and pre-validation.
  if (!payload.email || !payload.full_name) {
    return {
      success: false,
      message: "Full name and email are required fields.",
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.from("waitlist").insert({
      email: payload.email,
      full_name: payload.full_name,
      phone: payload.phone || null,
      status: "pending", // Schema default is 'pending'
    })

    if (error) {
      // Catch unique constraint violation error on email
      // PostgrestError code 23505 is unique violation in Postgres
      if (error.code === "23505") {
        return {
          success: false,
          message: "This email is already registered on the waitlist.",
        }
      }
      return {
        success: false,
        message: error.message || "An error occurred while joining the waitlist.",
      }
    }

    return {
      success: true,
      message: "Your request has been received! We will email you soon.",
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "An unexpected error occurred. Please try again.",
    }
  }
}
