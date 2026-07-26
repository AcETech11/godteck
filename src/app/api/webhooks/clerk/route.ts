import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body as raw text for signature verification to avoid JSON.stringify whitespace/formatting issues
  const body = await req.text();
  const payload = JSON.parse(body);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred verification failed", {
      status: 400,
    });
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Get primary/first email address
    const email = email_addresses?.[0]?.email_address || "";
    const full_name = `${first_name || ""} ${last_name || ""}`.trim();
    const avatar_url = image_url || "";

    const supabase = createAdminClient();

    // Insert user into Profiles table
    const { error } = await supabase.from("profiles").upsert({
      id,
      email,
      full_name: full_name || null,
      avatar_url: avatar_url || null,
      role: "member", // Default role: 'member'
    });

    if (error) {
      console.error("Error syncing profile to Supabase:", error);
      return new Response("Database error", { status: 500 });
    }

    return new Response("User synced successfully", { status: 200 });
  }

  return new Response("Webhook received", { status: 200 });
}
