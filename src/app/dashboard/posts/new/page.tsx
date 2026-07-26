"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast, Toaster } from "@/components/ui/toast"
import { postSchema, PostFormValues } from "../schema"
import { createPost } from "../actions"

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      image_url: "",
    },
  })

  async function onSubmit(data: PostFormValues) {
    setIsSubmitting(true)
    try {
      const response = await createPost({
        title: data.title,
        content: data.content,
        category: data.category,
        image_url: data.image_url || null,
      })

      if (response.success) {
        toast.add({
          title: "Post Submitted",
          description: "Your post has been successfully submitted and is pending admin moderation.",
          type: "success",
        })
        form.reset()
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        toast.add({
          title: "Submission Failed",
          description: response.error || "An error occurred while submitting your post.",
          type: "error",
        })
      }
    } catch (error: any) {
      toast.add({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-14rem)]">
      {/* Back to Dashboard Link */}
      <div className="w-full max-w-2xl mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="w-full max-w-2xl shadow-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-1.5 pb-6">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create New Post
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Share engineering updates, ask questions, or report maintenance activities. All submissions will be reviewed by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Post Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-700 dark:text-zinc-300">Post Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Annual generator service completed or Office wiring inspection required"
                        disabled={isSubmitting}
                        className="dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Dropdown and Image URL Field in a responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Field */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FormLabel className="font-semibold text-zinc-700 dark:text-zinc-300">Category</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger className="w-full h-11 border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus-visible:ring-primary dark:bg-zinc-950">
                            <SelectValue placeholder="Select a service category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <SelectItem value="generator">Generator Maintenance</SelectItem>
                            <SelectItem value="electrical">Electrical Systems</SelectItem>
                            <SelectItem value="plumbing">Pumping Machines / Plumbing</SelectItem>
                            <SelectItem value="building">Building Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Image URL Field */}
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-zinc-700 dark:text-zinc-300">Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          type="url"
                          disabled={isSubmitting}
                          className="dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary h-11"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Post Content Field */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-zinc-700 dark:text-zinc-300">Post Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details of the service, findings, or questions you have..."
                        disabled={isSubmitting}
                        className="min-h-36 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary leading-relaxed resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:justify-end">
                <Link href="/dashboard" className="w-full sm:w-auto order-last sm:order-first">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full h-11 font-semibold"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 font-semibold gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? "Submitting Post..." : "Submit Post for Review"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
