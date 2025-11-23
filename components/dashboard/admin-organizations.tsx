"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Building2, CheckCircle, XCircle, Search } from "lucide-react"
import type { Organization } from "@/lib/types"

export function AdminOrganizations() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  
  useEffect(() => {
    // Load organizations from localStorage
    try {
      const users = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      setOrganizations(users.filter((u: any) => u.role === "organization") as Organization[])
    } catch (error) {
      setOrganizations([])
    }
  }, [])

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const query = searchQuery.toLowerCase()
      return (
        org.orgName.toLowerCase().includes(query) ||
        org.email.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query)
      )
    })
  }, [organizations, searchQuery])

  const handleVerify = (orgId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      const updatedUsers = users.map((u: any) =>
        u.id === orgId ? { ...u, verified: true } : u
      )
      localStorage.setItem("mockUsers", JSON.stringify(updatedUsers))
      setOrganizations(updatedUsers.filter((u: any) => u.role === "organization") as Organization[])
      toast({
        title: "Organization verified",
        description: "The organization has been verified successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify organization.",
        variant: "destructive",
      })
    }
  }

  const handleReject = (orgId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("mockUsers") || "[]")
      const updatedUsers = users.map((u: any) =>
        u.id === orgId ? { ...u, verified: false } : u
      )
      localStorage.setItem("mockUsers", JSON.stringify(updatedUsers))
      setOrganizations(updatedUsers.filter((u: any) => u.role === "organization") as Organization[])
      toast({
        title: "Organization rejected",
        description: "The organization verification has been rejected.",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject organization.",
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
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredOrganizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No organizations found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrganizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{org.orgName}</CardTitle>
                      <Badge variant={org.verified ? "default" : "secondary"}>
                        {org.verified ? "Verified" : "Pending"}
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
                  {!org.verified && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(org.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(org.id)}
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
                      onClick={() => handleReject(org.id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Revoke Verification
                    </Button>
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

