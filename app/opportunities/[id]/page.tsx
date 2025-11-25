"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Calendar, Users, Accessibility, ArrowLeft, Briefcase } from "lucide-react"
import Link from "next/link"
import { OpportunityComments } from "@/components/opportunity-comments"
import { OpportunityLikes } from "@/components/opportunity-likes"
import { SiteFooter } from "@/components/site-footer"
import type { Opportunity } from "@/lib/types"
import { getOpportunities, saveOpportunities, getApplications, saveApplications } from "@/lib/mock-data"
import { generateId } from "@/lib/utils/id"

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      // Always get fresh opportunities with dynamically calculated application counts
      const opportunities = getOpportunities()
      const foundOpportunity = opportunities.find(
        (opp) => opp.id === params.id || (opp as any)._id === params.id
      )

      setOpportunity(foundOpportunity || null)

      if (user?.role === "volunteer" && foundOpportunity) {
        const applications = getApplications()
        const volunteerId = user._id || user.id
        const applied = applications.some(
          (app) =>
            app.volunteerId === volunteerId &&
            (app.opportunityId === foundOpportunity.id ||
              app.opportunityId === (foundOpportunity as any)._id ||
              app.opportunityId?._id === foundOpportunity.id ||
              app.opportunityId?._id === (foundOpportunity as any)._id)
        )
        setHasApplied(applied)
      } else {
        setHasApplied(false)
      }

      setIsLoading(false)
    }

    loadData()
    window.addEventListener("focus", loadData)
    // Refresh every 2 seconds to get real-time updates
    const interval = setInterval(loadData, 2000)

    return () => {
      window.removeEventListener("focus", loadData)
      clearInterval(interval)
    }
  }, [params.id, user?._id, user?.id, user?.role])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Loading opportunity...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Opportunity Not Found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.role === "volunteer") {
      setShowApplyDialog(true)
    }
  }

  const handleSubmitApplication = async () => {
    if (!user || user.role !== "volunteer" || !opportunity) return

    setIsSubmitting(true)

    try {
      const applications = getApplications()
      const volunteerId = user._id || user.id
      const opportunityId = opportunity.id || (opportunity as any)._id

      if (!opportunityId) {
        throw new Error("Invalid opportunity")
      }

      // Prevent duplicate applications
      const alreadyApplied = applications.some(
        (app) =>
          app.volunteerId === volunteerId &&
          (app.opportunityId === opportunityId || app.opportunityId?._id === opportunityId)
      )

      if (alreadyApplied) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this opportunity.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const newApplication = {
        id: generateId(),
        volunteerId,
        volunteerName: user.name,
        opportunityId,
        opportunityTitle: opportunity.title,
        status: "pending" as const,
        appliedAt: new Date().toISOString(),
        message: applicationMessage,
      }

      const updatedApplications = [...applications, newApplication]
      saveApplications(updatedApplications)

      // Reload opportunity with dynamically calculated application count
      const opportunities = getOpportunities()
      const refreshedOpportunity = opportunities.find(
        (opp) => opp.id === opportunityId || (opp as any)._id === opportunityId
      )

      if (refreshedOpportunity) {
        setOpportunity(refreshedOpportunity)
      }

      setHasApplied(true)
      toast({
        title: "Application submitted!",
        description: "The organization will review your application soon.",
      })

      setShowApplyDialog(false)
      setIsSubmitting(false)
      router.push("/dashboard?tab=applications")
    } catch (error: any) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href={user?.role === "volunteer" ? "/dashboard" : "/"}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {user?.role === "volunteer" ? "Back to Dashboard" : "Back to Opportunities"}
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-3xl">{opportunity.title}</CardTitle>
                  <CardDescription className="text-lg">{opportunity.organizationName}</CardDescription>
                </div>
                <Badge variant={opportunity.type === "remote" ? "secondary" : "default"} className="text-sm">
                  {opportunity.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span>{opportunity.applications} applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span>Posted {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{opportunity.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-xl font-semibold">Accessibility Features</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunity.accessibilityFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-xl font-semibold">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {user?.role === "volunteer" && !hasApplied && (
                <Button size="lg" className="w-full" onClick={handleApply}>
                  Apply for This Opportunity
                </Button>
              )}
              {user?.role === "volunteer" && hasApplied && (
                <Button size="lg" className="w-full" disabled>
                  Already Applied
                </Button>
              )}
              {!isAuthenticated && (
                <Button size="lg" className="w-full" onClick={handleApply}>
                  Login to Apply
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <OpportunityLikes opportunityId={opportunity._id || opportunity.id} />
          </div>

          <OpportunityComments opportunityId={opportunity._id || opportunity.id} />
        </div>
      </main>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {opportunity.title}</DialogTitle>
            <DialogDescription>Tell the organization why you're interested in this opportunity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                placeholder="Explain your interest and relevant experience..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  )
}
