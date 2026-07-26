"use client"

import * as React from "react"
import { WaitlistEntry, WaitlistStatus } from "@/types/database"
import { approveWaitlistUser, rejectWaitlistUser } from "./actions"
import { toast } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Search, Mail, Phone, Calendar } from "lucide-react"

interface WaitlistManagerProps {
  initialEntries: WaitlistEntry[]
}

type FilterStatus = "all" | WaitlistStatus

export function WaitlistManager({ initialEntries }: WaitlistManagerProps) {
  const [entries, setEntries] = React.useState<WaitlistEntry[]>(initialEntries)
  const [filter, setFilter] = React.useState<FilterStatus>("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [actionType, setActionType] = React.useState<"approve" | "reject" | null>(null)

  // Sync state if initialEntries change (e.g. on server-side revalidation)
  React.useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  const handleApprove = async (id: string, email: string) => {
    setProcessingId(id)
    setActionType("approve")
    try {
      const res = await approveWaitlistUser(id)
      if (res.success) {
        // Update local status
        setEntries((prev) =>
          prev.map((entry) => (entry.id === id ? { ...entry, status: "approved" as const } : entry))
        )

        if (res.error) {
          // Handled success with warning (e.g. email sending failed)
          toast.add({
            title: "Waitlist Approved with Warning",
            description: res.error,
            type: "warning",
          })
        } else {
          toast.add({
            title: "Waitlist Approved",
            description: `Invitation email sent successfully to ${email}.`,
            type: "success",
          })
        }
      } else {
        toast.add({
          title: "Approval Failed",
          description: res.error || "Failed to approve waitlist entry.",
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
      setActionType(null)
    }
  }

  const handleReject = async (id: string, email: string) => {
    setProcessingId(id)
    setActionType("reject")
    try {
      const res = await rejectWaitlistUser(id)
      if (res.success) {
        // Update local status
        setEntries((prev) =>
          prev.map((entry) => (entry.id === id ? { ...entry, status: "rejected" as const } : entry))
        )
        toast.add({
          title: "Waitlist Rejected",
          description: `Entry for ${email} has been rejected.`,
          type: "success",
        })
      } else {
        toast.add({
          title: "Rejection Failed",
          description: res.error || "Failed to reject waitlist entry.",
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
      setActionType(null)
    }
  }

  // Filter & Search entries
  const filteredEntries = React.useMemo(() => {
    return entries.filter((entry) => {
      const matchesFilter = filter === "all" ? true : entry.status === filter
      const matchesSearch =
        searchTerm === ""
          ? true
          : (entry.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [entries, filter, searchTerm])

  // Count helper
  const counts = React.useMemo(() => {
    return {
      all: entries.length,
      pending: entries.filter((e) => e.status === "pending").length,
      approved: entries.filter((e) => e.status === "approved").length,
      rejected: entries.filter((e) => e.status === "rejected").length,
    }
  }, [entries])

  const getStatusBadge = (status: WaitlistStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-200 dark:border-rose-800 font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800 font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full">
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => {
            const isActive = filter === status
            const label = status.charAt(0).toUpperCase() + status.slice(1)
            const count = counts[status]
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-300"
                      : "bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex p-4 bg-zinc-50 dark:bg-zinc-950 rounded-full text-zinc-400 mb-4 border border-zinc-100 dark:border-zinc-850">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">No submissions found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              {searchTerm
                ? "No waitlist submissions match your search criteria. Try checking your spelling or using a different query."
                : `There are currently no waitlist submissions under the "${filter}" filter status.`}
            </p>
            {(searchTerm || filter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => {
                  setFilter("all")
                  setSearchTerm("")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-950">
                <TableRow>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5 pl-6">
                    Full Name
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Contact Details
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5">
                    Date Submitted
                  </TableHead>
                  <TableHead className="font-semibold text-zinc-700 dark:text-zinc-300 py-3.5 pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const isProcessing = processingId === entry.id
                  const dateFormatted = new Date(entry.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <TableRow
                      key={entry.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors"
                    >
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-50 py-4 pl-6">
                        {entry.full_name || "N/A"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <a
                              href={`mailto:${entry.email}`}
                              className="hover:underline hover:text-primary transition-colors font-medium text-zinc-900 dark:text-zinc-100"
                            >
                              {entry.email}
                            </a>
                          </span>
                          {entry.phone && (
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <a href={`tel:${entry.phone}`} className="hover:underline">
                                {entry.phone}
                              </a>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(entry.status)}
                      </TableCell>
                      <TableCell className="py-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        {entry.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve & Invite Button */}
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors text-xs flex items-center gap-1 h-8 px-3"
                              disabled={isProcessing}
                              onClick={() => handleApprove(entry.id, entry.email)}
                            >
                              {isProcessing && actionType === "approve" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              <span>Approve &amp; Invite</span>
                            </Button>

                            {/* Reject Button */}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="font-medium shadow-sm transition-colors text-xs flex items-center gap-1 h-8 px-3"
                              disabled={isProcessing}
                              onClick={() => handleReject(entry.id, entry.email)}
                            >
                              {isProcessing && actionType === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              <span>Reject</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">No actions available</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
