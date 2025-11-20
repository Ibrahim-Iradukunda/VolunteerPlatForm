"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Users, Calendar, Trash2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function OrganizationOpportunities() {
  const { user, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const isRejected = (user as any)?.rejected
  const isVerified = user?.verified
  const canPostOpportunities = isVerified && !isRejected

  useEffect(() => {
    let isMounted = true
    let initialLoad = true
    
    const loadOpportunities = async () => {
      if (!user?._id && !user?.id) {
        if (isMounted) {
          setOpportunities([])
          setIsLoading(false)
        }
        return
      }

      try {
        const organizationId = user._id || user.id
        const params = new URLSearchParams()
        params.append("organizationId", organizationId)
        
        const response = await fetch(`/api/opportunities?${params.toString()}`, {
          headers: getAuthHeaders(),
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
            // Check if status or applications count changed
            const hasChange = prev.some((prevOpp) => {
              const newOpp = newOpportunities.find((o) => (o.id || o._id) === (prevOpp.id || prevOpp._id))
              return newOpp && (newOpp.status !== prevOpp.status || newOpp.applications !== prevOpp.applications)
            })
            return hasChange ? newOpportunities : prev
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
  }, [user?._id, user?.id])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        // Reload opportunities
        const organizationId = user?._id || user?.id
        const params = new URLSearchParams()
        params.append("organizationId", organizationId || "")
        const reloadResponse = await fetch(`/api/opportunities?${params.toString()}`, {
          headers: getAuthHeaders(),
        })
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setOpportunities(data.opportunities || [])
        }

        toast({
          title: "Opportunity deleted",
          description: "The opportunity has been removed.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete opportunity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error)
      toast({
        title: "Error",
        description: "Failed to delete opportunity. Please try again.",
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Opportunities</h2>
          <p className="text-muted-foreground">Manage your posted volunteer opportunities</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Link href={canPostOpportunities ? "/dashboard/organization/create" : "#"}>
                  <Button disabled={!canPostOpportunities}>
                    Post New Opportunity
                  </Button>
                </Link>
              </span>
            </TooltipTrigger>
            {!canPostOpportunities && (
              <TooltipContent>
                <p>
                  {isRejected 
                    ? "Your organization verification has been rejected. You cannot post opportunities." 
                    : "Your organization must be verified before you can post opportunities."}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {!canPostOpportunities && (
        <Alert variant={isRejected ? "destructive" : "default"}>
          {isRejected ? (
            <>
              <XCircle className="h-5 w-5" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                Your organization verification has been rejected. You cannot post new opportunities. 
                Please contact support for more information.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                Your organization must be verified by an admin before you can post opportunities. 
                Please wait for admin approval.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">Loading opportunities...</p>
          </CardContent>
        </Card>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">You haven't posted any opportunities yet.</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Link href={canPostOpportunities ? "/dashboard/organization/create" : "#"}>
                      <Button disabled={!canPostOpportunities}>Post Your First Opportunity</Button>
                    </Link>
                  </span>
                </TooltipTrigger>
                {!canPostOpportunities && (
                  <TooltipContent>
                    <p>
                      {isRejected 
                        ? "Your organization verification has been rejected. You cannot post opportunities." 
                        : "Your organization must be verified before you can post opportunities."}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity._id || opportunity.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{opportunity.description}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(opportunity.status)}>{opportunity.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{opportunity.applications} applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {opportunity.accessibilityFeatures.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link href={`/opportunities/${opportunity._id || opportunity.id}`}>
                    <Button variant="outline" className="bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(opportunity._id || opportunity.id)}
                    aria-label="Delete opportunity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
