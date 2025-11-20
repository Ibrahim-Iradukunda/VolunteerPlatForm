"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, XCircle } from "lucide-react"

export function OrganizationApplications() {
  const { user, getAuthHeaders, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let initialLoad = true
    
    const loadApplications = async () => {
      if (!isAuthenticated || (!user?._id && !user?.id)) {
        if (isMounted) {
          setApplications([])
          setIsLoading(false)
        }
        return
      }

      try {
        const organizationId = user._id || user.id
        const response = await fetch(`/api/applications?organizationId=${organizationId}`, {
          headers: getAuthHeaders(),
        })
        
        if (!isMounted) return
        
        if (response.ok) {
          const data = await response.json()
          const apps = data.applications || []
          const sorted = apps.sort(
            (a: any, b: any) =>
              new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime()
          )
          
          // Only update if data actually changed
          setApplications((prev) => {
            const prevIds = new Set(prev.map((a) => a.id || a._id).sort())
            const newIds = new Set(sorted.map((a) => a.id || a._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return sorted
            }
            // Check if status changed
            const hasStatusChange = prev.some((prevApp) => {
              const newApp = sorted.find((a) => (a.id || a._id) === (prevApp.id || prevApp._id))
              return newApp && newApp.status !== prevApp.status
            })
            return hasStatusChange ? sorted : prev
          })
        }
      } catch (error) {
        console.error("Error loading applications:", error)
      } finally {
        if (isMounted && initialLoad) {
          setIsLoading(false)
          initialLoad = false
        }
      }
    }

    loadApplications()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      if (isMounted) {
        loadApplications()
      }
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [user?._id, user?.id, isAuthenticated])

  const handleUpdateStatus = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Reload applications
        const organizationId = user?._id || user?.id
        const reloadResponse = await fetch(`/api/applications?organizationId=${organizationId}`, {
          headers: getAuthHeaders(),
        })
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          const apps = data.applications || []
          const sorted = apps.sort(
            (a: any, b: any) =>
              new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime()
          )
          setApplications(sorted)
        }

        toast({
          title: `Application ${newStatus}`,
          description: `You have ${newStatus} the volunteer's application.`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update application status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
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

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const reviewedApplications = applications.filter((app) => app.status !== "pending")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Applications</h2>
        <p className="text-muted-foreground">Review and respond to volunteer applications</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">Loading applications...</p>
          </CardContent>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">No applications received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingApplications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Pending Review ({pendingApplications.length})</h3>
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{application.volunteerName}</CardTitle>
                        <CardDescription>Applied for: {application.opportunityTitle}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>

                    {application.message && (
                      <div>
                        <p className="text-sm font-medium mb-1">Message from volunteer:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{application.message}</p>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="flex gap-2 flex-wrap">
                        <Button className="gap-2" onClick={() => handleUpdateStatus(application.id, "accepted")}>
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleUpdateStatus(application.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reviewedApplications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Reviewed ({reviewedApplications.length})</h3>
              {reviewedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{application.volunteerName}</CardTitle>
                        <CardDescription>Applied for: {application.opportunityTitle}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
