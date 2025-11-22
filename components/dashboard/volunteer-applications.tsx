"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"

export function VolunteerApplications() {
  const { user, getAuthHeaders, isAuthenticated } = useAuth()
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
        const volunteerId = user._id || user.id
        const response = await fetch(`/api/applications?volunteerId=${volunteerId}`, {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "rejected":
        return "Rejected"
      default:
        return "Pending"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Applications</h2>
        <p className="text-muted-foreground">Track the status of your volunteer applications</p>
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
            <p className="text-muted-foreground text-center mb-4">You haven't applied to any opportunities yet.</p>
            <Link href="/dashboard/browse">
              <Button>Browse Opportunities</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application._id || application.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{application.opportunityTitle || application.opportunityId?.title || "Opportunity"}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      Applied on {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(application.status)}>{getStatusLabel(application.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Message</p>
                    <p className="text-sm">{application.message}</p>
                  </div>
                )}
                <Link href={`/opportunities/${application.opportunityId?._id || application.opportunityId}`}>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    View Opportunity
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
