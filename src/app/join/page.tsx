"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { toast, Toaster } from "@/components/ui/toast"
import { joinWaitlistAction } from "./actions"

// Define Zod schema for waitlist form validation
const waitlistSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
})

// Infer form values type
type WaitlistFormValues = z.infer<typeof waitlistSchema>

export default function JoinPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Initialize React Hook Form with Zod validation
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  })

  // Submit handler
  async function onSubmit(data: WaitlistFormValues) {
    setIsSubmitting(true)
    try {
      const response = await joinWaitlistAction({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
      })

      if (response.success) {
        toast.add({
          title: "Success",
          description: response.message,
          type: "success",
        })
        form.reset()
        // Wait briefly for toast to show and then redirect
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        toast.add({
          title: "Registration Failed",
          description: response.message,
          type: "error",
        })
      }
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-14rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Join the Community Waitlist
          </CardTitle>
          <CardDescription className="text-center text-zinc-500 dark:text-zinc-400">
            Submit your details to request platform access. An admin will review
            your request and send an email invitation once approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Full Name field */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email address field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone number field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
