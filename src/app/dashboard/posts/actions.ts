"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendAdminNewPostNotification } from "@/lib/email/notifications"
import { revalidatePath } from "next/cache"
import { postSchema, PostFormValues } from "./schema"

export interface PostActionResponse {
  success: boolean
  error?: string
  postId?: string
}

/**
 * Next.js Server Action to create a new post for a member.
 */
export async function createPost(data: PostFormValues): Promise<PostActionResponse> {
  try {
    // 1. Authenticate user
    const session = await auth()
    const userId = session?.userId

    if (!userId) {
      return { success: false, error: "Unauthorized. Please sign in." }
    }

    // 2. Validate form input
    const validated = postSchema.safeParse(data)
    if (!validated.success) {
      const errorMsg = validated.error.issues.map(e => e.message).join(", ")
      return { success: false, error: errorMsg }
    }

    const { title, content, category, image_url } = validated.data
    const supabase = createAdminClient()

    // 3. Fetch author's name from profiles table using authenticated user ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching author profile:", profileError)
    }

    const authorName = profile?.full_name || "Valued Member"

    // 4. Insert the pending post into Supabase posts table
    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        author_id: userId,
        title,
        content,
        category,
        image_url: image_url || null,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !newPost) {
      return {
        success: false,
        error: insertError?.message || "Failed to submit post to the database.",
      }
    }

    const postId = newPost.id

    // 5. Trigger Resend transactional email notification to admin with fail-safe handling
    try {
      // We await the email creation but since it's wrapped in a try/catch,
      // any email failure will not halt the final success return statement.
      const emailResult = await sendAdminNewPostNotification({
        postTitle: title,
        authorName,
        postId,
      })

      if (!emailResult.success) {
        console.error("Fail-Safe Triggered: Admin email notification failed to send.", emailResult.error)
      }
    } catch (emailError) {
      console.error("Fail-Safe Triggered: Unexpected error during admin email notification dispatch:", emailError)
    }

    // 6. Revalidate dashboard path to update post list for member
    revalidatePath("/dashboard")

    return {
      success: true,
      postId,
    }
  } catch (err: any) {
    console.error("Unexpected error in createPost action:", err)
    return {
      success: false,
      error: err?.message || "An unexpected error occurred. Please try again.",
    }
  }
}
