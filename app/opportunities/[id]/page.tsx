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

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        const opportunityId = Array.isArray(params.id) ? params.id[0] : params.id
        if (!opportunityId) {
          setOpportunity(null)
          setIsLoading(false)
          return
        }
        
        // Try API first
        try {
          const response = await fetch(`/api/opportunities/${opportunityId}`, {
            headers: isAuthenticated ? getAuthHeaders() : {},
          })
          
          if (response.ok) {
            const data = await response.json()
            const foundOpportunity = data.opportunity
            
            if (!foundOpportunity) {
              console.error("Opportunity not found in API response for ID:", opportunityId)
              setOpportunity(null)
              setIsLoading(false)
              return
            }
            
            // Transform API response to match Opportunity type
            const opportunity: Opportunity = {
              id: foundOpportunity.id || foundOpportunity._id,
              _id: foundOpportunity._id || foundOpportunity.id,
              organizationId: foundOpportunity.organizationId?._id || foundOpportunity.organizationId,
              organizationName: foundOpportunity.organizationName,
              title: foundOpportunity.title,
              description: foundOpportunity.description,
              requirements: foundOpportunity.requirements || [],
              location: foundOpportunity.location,
              type: foundOpportunity.type,
              accessibilityFeatures: foundOpportunity.accessibilityFeatures || [],
              skills: foundOpportunity.skills || [],
              status: foundOpportunity.status,
              applications: foundOpportunity.applications || 0,
              createdAt: foundOpportunity.createdAt,
              updatedAt: foundOpportunity.updatedAt,
            }
            
            setOpportunity(opportunity)
            await checkApplicationStatus(opportunity)
            setIsLoading(false)
            return
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error("API returned error:", response.status, errorData)
          }
        } catch (apiError) {
          console.error("API fetch failed:", apiError)
        }
        
        // Not found
        setOpportunity(null)
      } catch (error) {
        console.error("Error loading opportunity:", error)
        setOpportunity(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    const checkApplicationStatus = async (opp: Opportunity) => {
      if (user?.role === "volunteer" && opp && isAuthenticated) {
        try {
          const oppId = opp.id || opp._id
          const response = await fetch(`/api/applications?volunteerId=${user.id || user._id}&opportunityId=${oppId}`, {
            headers: getAuthHeaders(),
          })
          if (response.ok) {
            const data = await response.json()
            setHasApplied((data.applications || []).length > 0)
          }
        } catch (error) {
          // Silent error handling
          setHasApplied(false)
        }
      } else {
        setHasApplied(false)
      }
    }

    loadData()
  }, [params.id, user?._id, user?.id, user?.role, isAuthenticated, getAuthHeaders])

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
      const opportunityId = opportunity.id || (opportunity as any)._id

      if (!opportunityId) {
        throw new Error("Invalid opportunity")
      }

      // Submit application via API
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          opportunityId,
          message: applicationMessage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit application")
      }

      // Reload opportunity from API to get updated application count
      try {
        const oppResponse = await fetch(`/api/opportunities/${opportunityId}`, {
          headers: isAuthenticated ? getAuthHeaders() : {},
        })
        if (oppResponse.ok) {
          const data = await oppResponse.json()
          const foundOpportunity = data.opportunity
          const updatedOpportunity: Opportunity = {
            id: foundOpportunity.id || foundOpportunity._id,
            _id: foundOpportunity._id || foundOpportunity.id,
            organizationId: foundOpportunity.organizationId?._id || foundOpportunity.organizationId,
            organizationName: foundOpportunity.organizationName,
            title: foundOpportunity.title,
            description: foundOpportunity.description,
            requirements: foundOpportunity.requirements || [],
            location: foundOpportunity.location,
            type: foundOpportunity.type,
            accessibilityFeatures: foundOpportunity.accessibilityFeatures || [],
            skills: foundOpportunity.skills || [],
            status: foundOpportunity.status,
            applications: foundOpportunity.applications || 0,
            createdAt: foundOpportunity.createdAt,
            updatedAt: foundOpportunity.updatedAt,
          }
          setOpportunity(updatedOpportunity)
        }
      } catch (error) {
        console.error("Error refreshing opportunity:", error)
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
            <OpportunityLikes
              opportunityId={opportunity._id || opportunity.id}
            />
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
                placeholder=""
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
