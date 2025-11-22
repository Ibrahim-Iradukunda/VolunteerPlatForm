"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, CheckCircle, XCircle, Search, MapPin, Users } from "lucide-react"
import Link from "next/link"

export function AdminOpportunities() {
  const { toast } = useToast()
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let initialLoad = true
    
    const loadOpportunities = async () => {
      try {
        const params = new URLSearchParams()
        // Explicitly send "all" to show all statuses
        params.append("status", statusFilter)
        if (searchQuery) {
          params.append("search", searchQuery)
        }

        const headers: HeadersInit = { "Content-Type": "application/json" }
        if (token) {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`/api/opportunities?${params.toString()}`, {
          headers,
        })
        
        if (!isMounted) return
        
        if (response.ok) {
          const data = await response.json()
          const newOpportunities = data.opportunities || []
          
          // Only update if data actually changed
          setOpportunities((prev) => {
            const prevIds = new Set(prev.map((o) => o.id || o._id).sort())
            const newIds = new Set(newOpportunities.map((o) => o.id || o._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return newOpportunities
            }
            // Check if status changed
            const hasStatusChange = prev.some((prevOpp) => {
              const newOpp = newOpportunities.find((o) => (o.id || o._id) === (prevOpp.id || prevOpp._id))
              return newOpp && newOpp.status !== prevOpp.status
            })
            return hasStatusChange ? newOpportunities : prev
          })
        }
      } catch (error) {
        console.error("Error loading opportunities:", error)
      } finally {
        if (isMounted && initialLoad) {
          setIsLoading(false)
          initialLoad = false
        }
      }
    }

    loadOpportunities()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      if (isMounted) {
        loadOpportunities()
      }
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [statusFilter, searchQuery, token])

  const filteredOpportunities = useMemo(() => {
    // API already filters by status, but we can do client-side search filtering
    return opportunities.filter((opp) => {
      const matchesSearch =
        searchQuery === "" ||
        opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [opportunities, searchQuery])

  const handleApprove = async (id: string) => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: "approved" }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Failed to approve opportunity:", error)
        toast({
          title: "Error",
          description: error.error || `Failed to approve opportunity. Status: ${response.status}`,
          variant: "destructive",
        })
        return
      }

      const data = await response.json().catch(() => null)
      console.log("Approval response:", data)

      // Update local state immediately for better UX
      setOpportunities((prev) => {
        const updated = prev.map((opp) => {
          const oppId = opp.id || opp._id
          if (oppId === id) {
            return { ...opp, status: "approved" }
          }
          return opp
        })
        // If viewing "pending" filter, remove the approved opportunity from the list
        if (statusFilter === "pending") {
          return updated.filter((opp) => {
            const oppId = opp.id || opp._id
            return oppId !== id || opp.status === "pending"
          })
        }
        return updated
      })
      
      // Reload opportunities to ensure consistency
      const params = new URLSearchParams()
      params.append("status", statusFilter)
      const reloadResponse = await fetch(`/api/opportunities?${params.toString()}`, {
        headers,
      })
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json()
        setOpportunities(reloadData.opportunities || [])
      }

      toast({
        title: "Opportunity approved",
        description: "The opportunity is now live on the platform.",
      })
    } catch (error) {
      console.error("Error approving opportunity:", error)
      toast({
        title: "Error",
        description: `Failed to approve opportunity: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      // Find the opportunity to check current status
      const opportunity = opportunities.find((opp) => (opp.id || opp._id) === id)
      const isCurrentlyRejected = opportunity?.status === "rejected"
      const isCurrentlyApproved = opportunity?.status === "approved"
      
      // If already rejected and clicking "Revoke Rejection", set back to pending
      // If approved and clicking "Revoke Approval", set to rejected
      // If pending and clicking "Reject", set to rejected
      const statusValue = isCurrentlyRejected ? "pending" : "rejected"
      
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: statusValue }),
      })

      if (response.ok) {
        // Update local state immediately for better UX
        setOpportunities((prev) =>
          prev.map((opp) => {
            const oppId = opp.id || opp._id
            if (oppId === id) {
              return { ...opp, status: statusValue }
            }
            return opp
          })
        )
        
        // Reload opportunities to ensure consistency
        const params = new URLSearchParams()
        params.append("status", statusFilter)
        const reloadResponse = await fetch(`/api/opportunities?${params.toString()}`, {
          headers,
        })
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setOpportunities(data.opportunities || [])
        }

        const actionText = isCurrentlyRejected 
          ? "Rejection revoked" 
          : isCurrentlyApproved 
            ? "Approval revoked" 
            : "Opportunity rejected"
        const description = isCurrentlyRejected
          ? "The opportunity's rejection has been revoked. It is now pending approval."
          : isCurrentlyApproved
            ? "The opportunity's approval has been revoked. It is now rejected."
            : "The opportunity has been rejected."

        toast({
          title: actionText,
          description: description,
          variant: isCurrentlyRejected ? "default" : "destructive",
        })
      } else {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({
          title: "Error",
          description: error.error || "Failed to update opportunity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating opportunity:", error)
      toast({
        title: "Error",
        description: "Failed to update opportunity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Manage Opportunities</h2>
        <p className="text-muted-foreground">Review and approve volunteer opportunities</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Loading opportunities...</p>
            </CardContent>
          </Card>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No opportunities found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id || opportunity._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                      <Badge variant={getStatusColor(opportunity.status)}>{opportunity.status}</Badge>
                    </div>
                    <CardDescription>{opportunity.organizationName}</CardDescription>
                  </div>
                  <Briefcase className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-2">{opportunity.description}</p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{opportunity.applications} applications</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunity.accessibilityFeatures.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {opportunity.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(opportunity.id || opportunity._id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(opportunity.id || opportunity._id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {opportunity.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(opportunity.id || opportunity._id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Revoke Approval
                    </Button>
                  )}
                  {opportunity.status === "rejected" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(opportunity.id || opportunity._id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(opportunity.id || opportunity._id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Revoke Rejection
                      </Button>
                    </>
                  )}
                  <Link href={`/opportunities/${opportunity.id || opportunity._id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}



