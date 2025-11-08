"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getApplications, saveApplications } from "@/lib/mock-data"
import { Briefcase, CheckCircle, XCircle, Search, RefreshCw, User } from "lucide-react"

export function AdminApplications() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("pending")
  const [applications, setApplications] = useState(getApplications())

  useEffect(() => {
    // Reload applications from localStorage on mount and when tab becomes visible
    const loadApplications = () => {
      const apps = getApplications()
      setApplications(apps)
    }
    loadApplications()
    
    // Reload when window gains focus (user switches back to tab)
    const handleFocus = () => {
      loadApplications()
    }
    window.addEventListener("focus", handleFocus)
    
    // Also check periodically (in case storage event doesn't fire)
    const interval = setInterval(loadApplications, 3000)
    
    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(interval)
    }
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app: any) => {
      const matchesSearch =
        searchQuery === "" ||
        app.volunteerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.opportunityTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.message?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  const refreshApplications = () => {
    const apps = getApplications()
    setApplications(apps)
    toast({
      title: "Applications refreshed",
      description: `Found ${apps.length} total applications.`,
    })
  }

  const handleStatusChange = (appId: string, newStatus: "pending" | "accepted" | "rejected") => {
    try {
      const updated = applications.map((app: any) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
      saveApplications(updated)
      setApplications(updated)
      toast({
        title: `Application ${newStatus === "accepted" ? "accepted" : newStatus === "rejected" ? "rejected" : "updated"}`,
        description: `The application status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (appId: string) => {
    try {
      const updated = applications.filter((app: any) => app.id !== appId)
      saveApplications(updated)
      setApplications(updated)
      toast({
        title: "Application deleted",
        description: "The application has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Manage Applications</h2>
          <p className="text-muted-foreground">Review and manage volunteer applications</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshApplications} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> total
            applications
            {statusFilter !== "all" && (
              <span className="ml-1">
                (filtered by: <strong>{statusFilter}</strong>)
              </span>
            )}
          </p>
          {applications.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Pending: {applications.filter((a: any) => a.status === "pending").length} | Accepted:{" "}
              {applications.filter((a: any) => a.status === "accepted").length} | Rejected:{" "}
              {applications.filter((a: any) => a.status === "rejected").length}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">
                {applications.length === 0
                  ? "No applications found in the system."
                  : `No applications match your filters. Total applications: ${applications.length}`}
              </p>
              {applications.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")} className="mt-2">
                  Show All Applications
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app: any) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{app.opportunityTitle}</CardTitle>
                      <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span>{app.volunteerName}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Briefcase className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Application Message</p>
                    <p className="text-sm">{app.message}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Applied Date</p>
                    <p className="text-sm">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Application ID</p>
                    <p className="text-sm font-mono">{app.id}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {app.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleStatusChange(app.id, "accepted")} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(app.id, "rejected")}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {app.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(app.id, "rejected")}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Mark as Rejected
                    </Button>
                  )}
                  {app.status === "rejected" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(app.id, "accepted")}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Accepted
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(app.id)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

