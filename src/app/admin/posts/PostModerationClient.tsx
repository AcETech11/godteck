"use client"

import * as React from "react"
import { approvePost, rejectPost } from "./actions"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, AlertTriangle, Calendar, User, Tag, Eye } from "lucide-react"

export interface PostWithAuthor {
  id: string
  author_id: string
  title: string
  content: string
  category: string
  image_url: string | null
  status: "pending" | "approved" | "rejected" | "flagged"
  rejection_reason: string | null
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface PostModerationClientProps {
  initialPosts: PostWithAuthor[]
}

export function PostModerationClient({ initialPosts }: PostModerationClientProps) {
  const [posts, setPosts] = React.useState<PostWithAuthor[]>(initialPosts)
  const [selectedPost, setSelectedPost] = React.useState<PostWithAuthor | null>(null)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [dialogActionLoading, setDialogActionLoading] = React.useState<"approve" | "reject" | null>(null)

  React.useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleApprove = async (postId: string) => {
    setProcessingId(postId)
    try {
      const res = await approvePost(postId)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.add({
          title: "Post Approved",
          description: "The post was successfully approved and published.",
          type: "success",
        })
        if (selectedPost?.id === postId) {
          setIsDialogOpen(false)
          setSelectedPost(null)
          setRejectionReason("")
        }
      } else {
        toast.add({
          title: "Approval Failed",
          description: res.error || "An error occurred during approval.",
          type: "error",
        })
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err?.message || "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleApproveFromDialog = async () => {
    if (!selectedPost) return
    setDialogActionLoading("approve")
    await handleApprove(selectedPost.id)
    setDialogActionLoading(null)
  }

  const handleReject = async (postId: string, reason?: string) => {
    setProcessingId(postId)
    try {
      const res = await rejectPost(postId, reason)
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.add({
          title: "Post Rejected",
          description: "The post was successfully rejected.",
          type: "success",
        })
        if (selectedPost?.id === postId) {
          setIsDialogOpen(false)
          setSelectedPost(null)
          setRejectionReason("")
        }
      } else {
        toast.add({
          title: "Rejection Failed",
          description: res.error || "An error occurred during rejection.",
          type: "error",
        })
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err?.message || "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectFromDialog = async () => {
    if (!selectedPost) return
    setDialogActionLoading("reject")
    await handleReject(selectedPost.id, rejectionReason)
    setDialogActionLoading(null)
  }

  const openPreview = (post: PostWithAuthor) => {
    setSelectedPost(post)
    setRejectionReason("")
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm max-w-xl mx-auto space-y-5">
          <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              All caught up!
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No pending posts to review. Awesome job!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-950">
                <TableRow>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5 pl-6">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Author Name
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Title
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const dateFormatted = new Date(post.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  const isProcessing = processingId === post.id

                  return (
                    <TableRow
                      key={post.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors"
                    >
                      <TableCell className="py-4 pl-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {dateFormatted}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-900 dark:text-zinc-100">
                        <div className="flex flex-col">
                          <span className="font-semibold">{post.profiles?.full_name || "N/A"}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{post.profiles?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 capitalize">
                          {post.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-zinc-900 dark:text-zinc-50 max-w-[240px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors text-xs flex items-center gap-1 h-8 px-3"
                            disabled={isProcessing}
                            onClick={() => handleApprove(post.id)}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="font-medium shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1 h-8 px-3 border border-zinc-200 dark:border-zinc-700"
                            disabled={isProcessing}
                            onClick={() => openPreview(post)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Review / Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden space-y-4">
            {posts.map((post) => {
              const dateFormatted = new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              const isProcessing = processingId === post.id

              return (
                <Card key={post.id} className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                  <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 capitalize">
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateFormatted}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-4 space-y-4">
                    <div className="flex flex-col gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {post.profiles?.full_name || "N/A"}
                        </span>
                      </span>
                      <span className="text-zinc-500 pl-5">{post.profiles?.email}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm text-xs flex items-center justify-center gap-1 h-8"
                        disabled={isProcessing}
                        onClick={() => handleApprove(post.id)}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 font-medium shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs flex items-center justify-center gap-1 h-8 border border-zinc-200 dark:border-zinc-700"
                        disabled={isProcessing}
                        onClick={() => openPreview(post)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review / Reject</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Post Preview and Moderation Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 capitalize">
                    {selectedPost.category}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    Submitted by {selectedPost.profiles?.full_name || "N/A"} ({selectedPost.profiles?.email})
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {selectedPost.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Preview and moderate user post submission.
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 space-y-4 max-h-[40vh] overflow-y-auto pr-2 border-y border-zinc-100 dark:border-zinc-800 py-4">
                {selectedPost.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={selectedPost.image_url}
                      alt={selectedPost.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              {/* Rejection Reason Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Rejection Reason (Optional, highly recommended for rejection)</span>
                </label>
                <Textarea
                  placeholder="Provide feedback on why this post is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[80px] text-sm text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 bg-transparent -mx-6 -mb-6 p-6 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedPost(null)
                    setRejectionReason("")
                  }}
                  className="w-full sm:w-auto h-9"
                  disabled={!!dialogActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectFromDialog}
                  disabled={!!dialogActionLoading}
                  className="w-full sm:w-auto h-9"
                >
                  {dialogActionLoading === "reject" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>Confirm Reject</span>
                </Button>
                <Button
                  onClick={handleApproveFromDialog}
                  disabled={!!dialogActionLoading}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                >
                  {dialogActionLoading === "approve" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>Confirm Approve</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
