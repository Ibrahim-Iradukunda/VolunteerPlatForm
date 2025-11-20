"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Building2, CheckCircle, XCircle, Search } from "lucide-react"
import type { Organization } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export function AdminOrganizations() {
  const { toast } = useToast()
  const { token, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    let isMounted = true
    let initialLoad = true

    const loadOrganizations = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setOrganizations([])
          setIsLoading(false)
        }
        return
      }

      if (initialLoad) {
        setIsLoading(true)
      }

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" }
        if (token) {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch("/api/admin/users?role=organization", {
          headers,
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          const newOrganizations = data.users || []
          
          // Only update if data actually changed
          setOrganizations((prev) => {
            const prevIds = new Set(prev.map((o) => o.id || (o as any)._id).sort())
            const newIds = new Set(newOrganizations.map((o) => o.id || (o as any)._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newOrganizations
            }
            // Check if verified or rejected status changed
            const hasStatusChange = prev.some((prevOrg) => {
              const newOrg = newOrganizations.find((o) => (o.id || (o as any)._id) === (prevOrg.id || (prevOrg as any)._id))
              return newOrg && (newOrg.verified !== prevOrg.verified || (newOrg as any).rejected !== (prevOrg as any).rejected)
            })
            return hasStatusChange ? newOrganizations : prev
          })
        } else {
          const error = await response.json().catch(() => ({}))
          console.error("Failed to load organizations:", error)
          setOrganizations([])
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error loading organizations:", error)
        setOrganizations([])
      } finally {
        if (isMounted) {
          if (initialLoad) {
            setIsLoading(false)
            initialLoad = false
          }
        }
      }
    }

    loadOrganizations()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      if (isMounted) {
        loadOrganizations()
      }
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [isAuthenticated, token])

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const query = searchQuery.toLowerCase()
      const orgName = (org.orgName || org.name || "").toLowerCase()
      const email = (org.email || "").toLowerCase()
      const description = (org.description || "").toLowerCase()

      return orgName.includes(query) || email.includes(query) || description.includes(query)
    })
  }, [organizations, searchQuery])

  const refreshOrganizations = async () => {
    try {
      setIsLoading(true)
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      const response = await fetch("/api/admin/users?role=organization", {
        headers,
      })
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.users || [])
      }
    } catch (error) {
      console.error("Error refreshing organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (orgId: string) => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/admin/organizations/${orgId}/verify`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ verified: true, rejected: false }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Organization verified",
          description: "The organization has been verified successfully.",
        })
        // Update the local state immediately for better UX
        setOrganizations((prev) =>
          prev.map((org) => {
            const orgIdToCheck = org.id || (org as any)._id
            if (orgIdToCheck === orgId) {
              return { ...org, verified: true, rejected: false }
            }
            return org
          })
        )
        // Then refresh to ensure consistency
        await refreshOrganizations()
      } else {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({
          title: "Error",
          description: error.error || "Failed to verify organization.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying organization:", error)
      toast({
        title: "Error",
        description: "Failed to verify organization. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (orgId: string) => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      
      // Find the organization to check current status
      const org = organizations.find((o) => (o.id || (o as any)._id) === orgId)
      const isCurrentlyRejected = (org as any)?.rejected
      const isCurrentlyVerified = org?.verified
      
      // If already rejected and clicking "Revoke Verification", undo the rejection (set rejected=false)
      // If verified and clicking "Revoke Verification", set verified=false and rejected=true
      // If pending and clicking "Reject", set rejected=true
      const rejectedValue = isCurrentlyRejected ? false : true
      const verifiedValue = isCurrentlyVerified ? false : false
      
      const response = await fetch(`/api/admin/organizations/${orgId}/verify`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ verified: verifiedValue, rejected: rejectedValue }),
      })

      if (response.ok) {
        const data = await response.json()
        const actionText = isCurrentlyRejected ? "Rejection revoked" : isCurrentlyVerified ? "Verification revoked" : "Organization rejected"
        toast({
          title: actionText,
          description: isCurrentlyRejected 
            ? "The organization's rejection has been revoked. They are now pending verification."
            : isCurrentlyVerified
              ? "The organization's verification has been revoked successfully."
              : "The organization has been rejected.",
        })
        // Update the local state immediately for better UX
        setOrganizations((prev) =>
          prev.map((org) => {
            const orgIdToCheck = org.id || (org as any)._id
            if (orgIdToCheck === orgId) {
              return { ...org, verified: verifiedValue, rejected: rejectedValue }
            }
            return org
          })
        )
        // Then refresh to ensure consistency
        await refreshOrganizations()
      } else {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({
          title: "Error",
          description: error.error || "Failed to revoke verification.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error revoking verification:", error)
      toast({
        title: "Error",
        description: "Failed to revoke verification. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Manage Organizations</h2>
        <p className="text-muted-foreground">Review and verify organization registrations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder=""
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Loading organizations...</p>
            </CardContent>
          </Card>
        ) : filteredOrganizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No organizations found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrganizations.map((org) => (
            <Card key={org.id || (org as any)._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{org.orgName || org.name || "Organization"}</CardTitle>
                      <Badge 
                        variant={
                          org.verified 
                            ? "default" 
                            : (org as any).rejected 
                              ? "destructive" 
                              : "secondary"
                        }
                      >
                        {org.verified ? "Verified" : (org as any).rejected ? "Rejected" : "Pending"}
                      </Badge>
                    </div>
                    <CardDescription>{org.email}</CardDescription>
                  </div>
                  <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{org.description || "No description provided"}</p>
                </div>
                {org.contactInfo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Contact Info</p>
                    <p className="text-sm">{org.contactInfo}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {!org.verified && !(org as any).rejected && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(org.id || (org as any)._id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(org.id || (org as any)._id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {org.verified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(org.id || (org as any)._id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Revoke Verification
                    </Button>
                  )}
                  {!org.verified && (org as any).rejected && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(org.id || (org as any)._id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(org.id || (org as any)._id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Revoke Verification
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

