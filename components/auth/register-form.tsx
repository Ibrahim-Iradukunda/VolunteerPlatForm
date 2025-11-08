"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "" as UserRole,
    // Volunteer specific
    skills: "",
    availability: "",
    disabilityStatus: "",
    accessibilityNeeds: "",
    // Organization specific
    orgName: "",
    contactInfo: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userData: any = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    }

    if (formData.role === "volunteer") {
      userData.skills = formData.skills.split(",").map((s) => s.trim())
      userData.availability = formData.availability
      userData.disabilityStatus = formData.disabilityStatus
      userData.accessibilityNeeds = formData.accessibilityNeeds.split(",").map((s) => s.trim())
    } else if (formData.role === "organization") {
      userData.orgName = formData.orgName
      userData.contactInfo = formData.contactInfo
      userData.description = formData.description
    }

    const success = await register(userData)

    if (success) {
      toast({
        title: "Registration successful",
        description:
          formData.role === "organization"
            ? "Your account is pending admin approval."
            : "Welcome! You can now access your dashboard.",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Registration failed",
        description: "Email already exists or invalid data",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join our inclusive volunteer community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role" aria-label="Select your role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role === "volunteer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Teaching, Communication, Technology"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Evenings, Full-time"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabilityStatus">Disability Status (optional)</Label>
                <Input
                  id="disabilityStatus"
                  placeholder="e.g., Visual impairment, Mobility impairment"
                  value={formData.disabilityStatus}
                  onChange={(e) => setFormData({ ...formData, disabilityStatus: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessibilityNeeds">Accessibility Needs (comma separated, optional)</Label>
                <Input
                  id="accessibilityNeeds"
                  placeholder="e.g., Wheelchair access, Sign language, Remote work"
                  value={formData.accessibilityNeeds}
                  onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                />
              </div>
            </>
          )}

          {formData.role === "organization" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Your Organization Name"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  required={formData.role === "organization"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Input
                  id="contactInfo"
                  placeholder="Phone number or additional email"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your organization and its mission"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !formData.role}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
