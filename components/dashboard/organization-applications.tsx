"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getApplications, getOpportunities, saveApplications } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, XCircle } from "lucide-react"

export function OrganizationApplications() {
  const { user } = useAuth()
  const { toast } = useToast()
  const opportunities = getOpportunities().filter((opp) => opp.organizationId === user?.id)
  const myOpportunityIds = opportunities.map((opp) => opp.id)

  const [applications, setApplications] = useState(
    getApplications()
      .filter((app) => myOpportunityIds.includes(app.opportunityId))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()),
  )

  const handleUpdateStatus = (applicationId: string, newStatus: "accepted" | "rejected") => {
    const allApplications = getApplications()
    const updated = allApplications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
    saveApplications(updated)
    setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))

    toast({
      title: `Application ${newStatus}`,
      description: `You have ${newStatus} the volunteer's application.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const reviewedApplications = applications.filter((app) => app.status !== "pending")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Applications</h2>
        <p className="text-muted-foreground">Review and respond to volunteer applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">No applications received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingApplications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Pending Review ({pendingApplications.length})</h3>
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{application.volunteerName}</CardTitle>
                        <CardDescription>Applied for: {application.opportunityTitle}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>

                    {application.message && (
                      <div>
                        <p className="text-sm font-medium mb-1">Message from volunteer:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{application.message}</p>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2" onClick={() => handleUpdateStatus(application.id, "accepted")}>
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2"
                          onClick={() => handleUpdateStatus(application.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reviewedApplications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Reviewed ({reviewedApplications.length})</h3>
              {reviewedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{application.volunteerName}</CardTitle>
                        <CardDescription>Applied for: {application.opportunityTitle}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
