"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Building2, CheckCircle, Clock } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export function AdminOverview() {
  const { token, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    let initialLoad = true
    
    const loadData = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setUsers([])
          setOpportunities([])
          setApplications([])
          setIsLoading(false)
        }
        return
      }

      if (initialLoad) {
        setIsLoading(true)
      }

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" }
        const authToken = token
        if (authToken) {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`
        }

        const usersPromise = fetch("/api/admin/users", {
          headers,
        })

        const opportunitiesPromise = fetch("/api/opportunities", {
          headers,
        })

        const applicationsPromise = fetch("/api/applications", {
          headers,
        })

        const [usersRes, opportunitiesRes, applicationsRes] = await Promise.all([
          usersPromise,
          opportunitiesPromise,
          applicationsPromise,
        ])

        if (!isMounted) return

        if (usersRes.ok) {
          const data = await usersRes.json()
          const newUsers = data.users || []
          // Only update if data actually changed
          setUsers((prev) => {
            const prevIds = new Set(prev.map((u) => u.id || u._id).sort())
            const newIds = new Set(newUsers.map((u) => u.id || u._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newUsers
            }
            return prev
          })
        } else {
          setUsers([])
        }

        if (opportunitiesRes.ok) {
          const data = await opportunitiesRes.json()
          const newOpportunities = data.opportunities || []
          // Only update if data actually changed
          setOpportunities((prev) => {
            const prevIds = new Set(prev.map((o) => o.id || o._id).sort())
            const newIds = new Set(newOpportunities.map((o) => o.id || o._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newOpportunities
            }
            return prev
          })
        } else {
          setOpportunities([])
        }

        if (applicationsRes.ok) {
          const data = await applicationsRes.json()
          const newApplications = data.applications || []
          // Only update if data actually changed
          setApplications((prev) => {
            const prevIds = new Set(prev.map((a) => a.id || a._id).sort())
            const newIds = new Set(newApplications.map((a) => a.id || a._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newApplications
            }
            return prev
          })
        } else {
          setApplications([])
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error loading admin overview data:", error)
        setUsers([])
        setOpportunities([])
        setApplications([])
      } finally {
        if (isMounted) {
          if (initialLoad) {
            setIsLoading(false)
            initialLoad = false
          }
        }
      }
    }

    loadData()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      if (isMounted) {
        loadData()
      }
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [isAuthenticated, token])

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Overview of platform statistics and activities</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Loading statistics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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

