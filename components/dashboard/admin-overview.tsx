"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Building2, CheckCircle, Clock } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { getOpportunities, getApplications } from "@/lib/mock-data"

export function AdminOverview() {
  const [users, setUsers] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    const loadData = () => {
      // Load data from localStorage
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      setUsers(mockUsers)
      // getOpportunities() now calculates application counts dynamically
      setOpportunities(getOpportunities())
      setApplications(getApplications())
    }

    loadData()
    window.addEventListener("focus", loadData)
    // Refresh every 2 seconds to get real-time application count updates
    const interval = setInterval(loadData, 2000)

    return () => {
      window.removeEventListener("focus", loadData)
      clearInterval(interval)
    }
  }, [])

  const stats = useMemo(() => {
    const organizations = users.filter((u: any) => u.role === "organization")
    const volunteers = users.filter((u: any) => u.role === "volunteer")
    const verifiedOrgs = organizations.filter((u: any) => u.verified).length

    return {
      totalUsers: users.length,
      totalVolunteers: volunteers.length,
      totalOrganizations: organizations.length,
      verifiedOrganizations: verifiedOrgs,
      totalOpportunities: opportunities.length,
      approvedOpportunities: opportunities.filter((opp: any) => opp.status === "approved").length,
      pendingOpportunities: opportunities.filter((opp: any) => opp.status === "pending").length,
      totalApplications: applications.length,
      pendingApplications: applications.filter((app: any) => app.status === "pending").length,
    }
  }, [users, opportunities, applications])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform statistics and activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVolunteers} volunteers, {stats.totalOrganizations} organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrganizations - stats.verifiedOrganizations} pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOpportunities} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span className="text-sm">Organization Verifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span className="text-sm font-bold">
                  {stats.totalOrganizations - stats.verifiedOrganizations}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span className="text-sm">Opportunity Approvals</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span className="text-sm font-bold">{stats.pendingOpportunities}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Opportunities</span>
              <span className="text-sm font-bold text-green-600">{stats.approvedOpportunities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Applications</span>
              <span className="text-sm font-bold">{stats.totalApplications}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Verified Organizations</span>
              <span className="text-sm font-bold text-green-600">{stats.verifiedOrganizations}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

