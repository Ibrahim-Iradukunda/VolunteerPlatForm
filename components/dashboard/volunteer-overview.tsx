"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, Clock, CheckCircle } from "lucide-react"
import type { Volunteer } from "@/lib/types"
import { getApplications, getOpportunities } from "@/lib/mock-data"

export function VolunteerOverview() {
  const { user } = useAuth()
  const volunteer = user as Volunteer
  const [applications, setApplications] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>(getOpportunities())

  useEffect(() => {
    const loadData = () => {
      const allOpportunities = getOpportunities()
      setOpportunities(allOpportunities)

      if (user?._id || user?.id) {
        const volunteerId = user._id || user.id
        const allApplications = getApplications()
        const myApplications = allApplications.filter((app) => app.volunteerId === volunteerId)
        setApplications(myApplications)
      } else {
        setApplications([])
      }
    }

    loadData()
    window.addEventListener("focus", loadData)
    // Refresh every 2 seconds to get real-time application count updates
    const interval = setInterval(loadData, 2000)

    return () => {
      window.removeEventListener("focus", loadData)
      clearInterval(interval)
    }
  }, [user?._id, user?.id])

  const approvedOpportunities = useMemo(() => {
    return opportunities.filter((opp) => opp.status === "approved")
  }, [opportunities])

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {volunteer?.name}!</h2>
        <p className="text-muted-foreground">Here's an overview of your volunteer activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Successful applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Open opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Your volunteer information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{volunteer?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Availability</p>
              <p className="text-sm">{volunteer?.availability || "Not specified"}</p>
            </div>
          </div>

          {volunteer?.skills && volunteer.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {volunteer?.accessibilityNeeds && volunteer.accessibilityNeeds.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Accessibility Needs</p>
              <div className="flex flex-wrap gap-2">
                {volunteer.accessibilityNeeds.map((need, index) => (
                  <Badge key={index} variant="outline">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {volunteer?.disabilityStatus && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disability Status</p>
              <p className="text-sm">{volunteer.disabilityStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
