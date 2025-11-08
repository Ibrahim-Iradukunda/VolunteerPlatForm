"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Users, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import { getOpportunities, saveOpportunities } from "@/lib/mock-data"

export function OrganizationOpportunities() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [opportunities, setOpportunities] = useState<any[]>([])

  useEffect(() => {
    const loadOpportunities = () => {
      if (user?._id || user?.id) {
        const organizationId = user._id || user.id
        const opps = getOpportunities().filter((opp) => opp.organizationId === organizationId)
        setOpportunities(opps)
      } else {
        setOpportunities([])
      }
    }

    loadOpportunities()
    window.addEventListener("focus", loadOpportunities)
    // Refresh every 2 seconds to get real-time application count updates
    const interval = setInterval(loadOpportunities, 2000)

    return () => {
      window.removeEventListener("focus", loadOpportunities)
      clearInterval(interval)
    }
  }, [user?._id, user?.id])

  const handleDelete = (id: string) => {
    try {
      const allOpportunities = getOpportunities()
      const updated = allOpportunities.filter(
        (opp) => opp.id !== id && (opp as any)._id !== id
      )
      saveOpportunities(updated)

      const organizationId = user?._id || user?.id
      setOpportunities(updated.filter((opp) => opp.organizationId === organizationId))

      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed.",
      })
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
        <Link href="/dashboard/organization/create">
          <Button>Post New Opportunity</Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">You haven't posted any opportunities yet.</p>
            <Link href="/dashboard/organization/create">
              <Button>Post Your First Opportunity</Button>
            </Link>
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

                <div className="flex gap-2">
                  <Link href={`/opportunities/${opportunity._id || opportunity.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
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
