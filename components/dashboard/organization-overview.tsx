"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, Clock, Users, CheckCircle, XCircle, AlertCircle, Building2, Mail, Phone, FileText } from "lucide-react"
import type { Organization } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OrganizationOverview() {
  const { user, getAuthHeaders } = useAuth()
  const organization = user as Organization
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (!isMounted) return
      
      if (user?._id || user?.id) {
        try {
          const organizationId = user._id || user.id
          
          // Load opportunities from API
          const params = new URLSearchParams()
          params.append("organizationId", organizationId)
          const oppResponse = await fetch(`/api/opportunities?${params.toString()}`, {
            headers: getAuthHeaders(),
          })
          
          if (oppResponse.ok) {
            const oppData = await oppResponse.json()
            const opps = oppData.opportunities || []
            
            // Only update if data actually changed
            setOpportunities((prev) => {
              const prevIds = new Set(prev.map((o) => o.id || o._id).sort())
              const newIds = new Set(opps.map((o) => o.id || o._id).sort())
              if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
                return opps
              }
              return prev
            })

            // Load applications from API
            const appResponse = await fetch(`/api/applications?organizationId=${organizationId}`, {
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
          }
        } catch (error) {
          console.error("Error loading data:", error)
        }
      } else {
        setOpportunities([])
        setApplications([])
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

  // Determine verification status
  const getVerificationStatus = () => {
    if (organization?.verified) {
      return {
        label: "Verified",
        variant: "default" as const,
        icon: CheckCircle,
        description: "Your organization is verified and can post opportunities.",
        alertType: "success" as const,
      }
    } else if ((organization as any)?.rejected) {
      return {
        label: "Rejected",
        variant: "destructive" as const,
        icon: XCircle,
        description: "Your organization verification has been rejected. Please contact support for more information.",
        alertType: "destructive" as const,
      }
    } else {
      return {
        label: "Pending Verification",
        variant: "secondary" as const,
        icon: Clock,
        description: "Your organization is pending admin verification. You cannot post opportunities until verified.",
        alertType: "warning" as const,
      }
    }
  }

  const verificationStatus = getVerificationStatus()
  const StatusIcon = verificationStatus.icon

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome, {organization?.orgName}!
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">Manage your volunteer opportunities and applications</p>
        
        {/* Verification Status Alert */}
        <Alert 
          variant={organization?.verified ? "default" : "destructive"}
          className={organization?.verified ? "border-green-500/50 bg-green-500/5" : "border-yellow-500/50 bg-yellow-500/5"}
        >
          <StatusIcon className="h-5 w-5" />
          <AlertTitle className="font-semibold">
            Status: {verificationStatus.label}
          </AlertTitle>
          <AlertDescription className="mt-1">
            {verificationStatus.description}
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Opportunities</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Approved</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Live opportunities</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Applications</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">From volunteers</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Pending Review</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Organization Profile</CardTitle>
              <CardDescription className="text-base">Your organization information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Organization Name
              </div>
              <p className="text-sm font-medium">{organization?.orgName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="text-sm font-medium">{organization?.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Phone className="h-4 w-4" />
                Contact Info
              </div>
              <p className="text-sm font-medium">{organization?.contactInfo || "Not provided"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <StatusIcon className="h-4 w-4" />
                Verification Status
              </div>
              <Badge 
                variant={verificationStatus.variant} 
                className="text-sm font-semibold px-3 py-1"
              >
                {verificationStatus.label}
              </Badge>
            </div>
          </div>

          {organization?.description && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Description
              </div>
              <p className="text-sm leading-relaxed">{organization.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
