"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Organization } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const accessibilityOptions = [
  "Wheelchair accessible",
  "Sign language support available",
  "Flexible schedule",
  "Fully remote",
  "Screen reader compatible materials",
  "Transportation provided",
  "Adaptive equipment available",
  "Flexible hours",
  "Remote participation available",
]

export default function CreateOpportunityPage() {
  const { user, getAuthHeaders } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const organization = user as Organization

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "onsite" as "onsite" | "remote" | "hybrid",
    skills: "",
    accessibilityFeatures: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if organization can post opportunities
  useEffect(() => {
    if (organization) {
      if ((organization as any).rejected) {
        toast({
          title: "Access Denied",
          description: "Your organization verification has been rejected. You cannot post opportunities.",
          variant: "destructive",
        })
        router.push("/dashboard/organization")
      } else if (!organization.verified) {
        toast({
          title: "Verification Required",
          description: "Your organization must be verified before you can post opportunities.",
          variant: "destructive",
        })
        router.push("/dashboard/organization")
      }
    }
  }, [organization, router, toast])

  const handleAccessibilityChange = (option: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, accessibilityFeatures: [...formData.accessibilityFeatures, option] })
    } else {
      setFormData({ ...formData, accessibilityFeatures: formData.accessibilityFeatures.filter((f) => f !== option) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements.split("\n").filter((r) => r.trim()),
          location: formData.location,
          type: formData.type,
          accessibilityFeatures: formData.accessibilityFeatures,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
        }),
      })

      if (response.ok) {
        toast({
          title: "Opportunity posted!",
          description: organization.verified
            ? "Your opportunity is now live."
            : "Your opportunity is pending admin approval.",
        })
        router.push("/dashboard/organization")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create opportunity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating opportunity:", error)
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render the form if organization is rejected or not verified
  if (!organization || (organization as any).rejected || !organization.verified) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/dashboard/organization">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Card>
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  {(organization as any)?.rejected ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      <AlertTitle>Access Denied</AlertTitle>
                      <AlertDescription>
                        Your organization verification has been rejected. You cannot post opportunities. 
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
              </CardContent>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link href="/dashboard/organization">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Post New Opportunity</CardTitle>
              <CardDescription>Create a volunteer opportunity for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title</Label>
                  <Input
                    id="title"
                    placeholder=""
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder=""
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    placeholder=""
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder=""
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Opportunity Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder=""
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Accessibility Features</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {accessibilityOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={option}
                          checked={formData.accessibilityFeatures.includes(option)}
                          onCheckedChange={(checked) => handleAccessibilityChange(option, checked as boolean)}
                        />
                        <Label htmlFor={option} className="text-sm font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Opportunity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
