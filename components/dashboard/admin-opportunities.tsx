"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getOpportunities, saveOpportunities } from "@/lib/mock-data"
import { Briefcase, CheckCircle, XCircle, Search, MapPin, Users } from "lucide-react"
import Link from "next/link"

export function AdminOpportunities() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [opportunities, setOpportunities] = useState(getOpportunities())

  useEffect(() => {
    const loadOpportunities = () => {
      // getOpportunities() now calculates application counts dynamically
      setOpportunities(getOpportunities())
    }

    loadOpportunities()
    window.addEventListener("focus", loadOpportunities)
    // Refresh every 2 seconds to get real-time application count updates
    const interval = setInterval(loadOpportunities, 2000)

    return () => {
      window.removeEventListener("focus", loadOpportunities)
      clearInterval(interval)
    }
  }, [])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        searchQuery === "" ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || opp.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [opportunities, searchQuery, statusFilter])

  const handleApprove = (id: string) => {
    const updated = opportunities.map((opp) =>
      opp.id === id ? { ...opp, status: "approved" as const } : opp
    )
    saveOpportunities(updated)
    // Reload to get fresh counts
    setOpportunities(getOpportunities())
    toast({
      title: "Opportunity approved",
      description: "The opportunity is now live on the platform.",
    })
  }

  const handleReject = (id: string) => {
    const updated = opportunities.map((opp) =>
      opp.id === id ? { ...opp, status: "rejected" as const } : opp
    )
    saveOpportunities(updated)
    // Reload to get fresh counts
    setOpportunities(getOpportunities())
    toast({
      title: "Opportunity rejected",
      description: "The opportunity has been rejected.",
      variant: "destructive",
    })
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
            placeholder="Search opportunities..."
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
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No opportunities found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id}>
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
                      <Button size="sm" onClick={() => handleApprove(opportunity.id)} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(opportunity.id)}
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
                      onClick={() => handleReject(opportunity.id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Revoke Approval
                    </Button>
                  )}
                  {opportunity.status === "rejected" && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(opportunity.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
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



