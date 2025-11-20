"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, Clock, CheckCircle, XCircle, TrendingUp, UserCircle, Mail, Calendar, Heart, Accessibility } from "lucide-react"
import type { Volunteer } from "@/lib/types"

export function VolunteerOverview() {
  const { user, getAuthHeaders } = useAuth()
  const volunteer = user as Volunteer
  const [applications, setApplications] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (!isMounted) return
      
      try {
        // Load opportunities from API
        const params = new URLSearchParams()
        params.append("status", "approved")
        const oppResponse = await fetch(`/api/opportunities?${params.toString()}`)
        if (oppResponse.ok) {
          const oppData = await oppResponse.json()
          const allOpportunities = oppData.opportunities || []
          
          // Only update if data actually changed
          setOpportunities((prev) => {
            const prevIds = new Set(prev.map((o) => o.id || o._id).sort())
            const newIds = new Set(allOpportunities.map((o) => o.id || o._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return allOpportunities
            }
            return prev
          })
        }

        // Load applications from API
        if (user?._id || user?.id) {
          const volunteerId = user._id || user.id
          const appResponse = await fetch(`/api/applications?volunteerId=${volunteerId}`, {
            headers: getAuthHeaders(),
          })
          if (appResponse.ok) {
            const appData = await appResponse.json()
            const myApplications = appData.applications || []
            
            // Only update if data actually changed
            setApplications((prev) => {
              const prevIds = new Set(prev.map((a) => a.id || a._id).sort())
              const newIds = new Set(myApplications.map((a) => a.id || a._id).sort())
              if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
                return myApplications
              }
              return prev
            })
          }
        } else {
          setApplications([])
        }
      } catch (error) {
        console.error("Error loading data:", error)
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
  }, [user?._id, user?.id, getAuthHeaders])

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
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Welcome back, {volunteer?.name}!
        </h2>
        <p className="text-lg text-muted-foreground">Here's an overview of your volunteer activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Applications</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Pending</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Accepted</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful applications</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Available</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedOpportunities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Open opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Profile</CardTitle>
              <CardDescription className="text-base">Your volunteer information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="text-sm font-medium">{volunteer?.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Availability
              </div>
              <p className="text-sm font-medium">{volunteer?.availability || "Not specified"}</p>
            </div>
          </div>

          {volunteer?.skills && volunteer.skills.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-medium px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {volunteer?.accessibilityNeeds && volunteer.accessibilityNeeds.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Accessibility className="h-4 w-4 text-primary" />
                Accessibility Needs
              </div>
              <div className="flex flex-wrap gap-2">
                {volunteer.accessibilityNeeds.map((need, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-medium px-3 py-1 bg-primary/5 border-primary/20">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {volunteer?.disabilityStatus && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Heart className="h-4 w-4 text-primary" />
                Disability Status
              </div>
              <p className="text-sm font-medium">{volunteer.disabilityStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
