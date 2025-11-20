"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, Clock, Users, CheckCircle } from "lucide-react"
import type { Organization } from "@/lib/types"
import { getApplications, getOpportunities } from "@/lib/mock-data"

export function OrganizationOverview() {
  const { user } = useAuth()
  const organization = user as Organization
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    const loadData = () => {
      if (user?._id || user?.id) {
        const organizationId = user._id || user.id
        const opps = getOpportunities().filter((opp) => opp.organizationId === organizationId)
        setOpportunities(opps)

        const allApplications = getApplications()
        const myApplications = allApplications.filter((app) => {
          if (typeof app.opportunityId === "string") {
            return opps.some((opp) => opp.id === app.opportunityId)
          }
          return opps.some((opp) => opp.id === app.opportunityId?._id || opp.id === app.opportunityId)
        })
        setApplications(myApplications)
      } else {
        setOpportunities([])
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

  const stats = useMemo(() => {
    const totalOpportunities = opportunities.length
    const approved = opportunities.filter((opp) => opp.status === "approved").length
    const pending = opportunities.filter((opp) => opp.status === "pending").length
    const totalApplications = applications.length
    const pendingApplications = applications.filter((app) => app.status === "pending").length

    return {
      totalOpportunities,
      approved,
      pending,
      totalApplications,
      pendingApplications,
    }
  }, [opportunities, applications])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome, {organization?.orgName}!</h2>
        <p className="text-muted-foreground">Manage your volunteer opportunities and applications</p>
        {!organization?.verified && (
          <Badge variant="secondary" className="mt-2">
            Pending Verification
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Live opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">From volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Your organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
              <p className="text-sm">{organization?.orgName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{organization?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Info</p>
              <p className="text-sm">{organization?.contactInfo || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={organization?.verified ? "default" : "secondary"}>
                {organization?.verified ? "Verified" : "Pending Verification"}
              </Badge>
            </div>
          </div>

          {organization?.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{organization.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
