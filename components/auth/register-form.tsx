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
import {
  Accessibility,
  Briefcase,
  Calendar,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react"

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
    confirmPassword: "",
  })
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const passwordMeetsRequirements = (password: string) => {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
  }

  const passwordsMatch =
    confirmTouched &&
    formData.confirmPassword.length > 0 &&
    formData.password.length > 0 &&
    formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordMeetsRequirements(formData.password)) {
      toast({
        title: "Password requirements",
        description: "Use at least 6 characters with letters and numbers.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Make sure the confirmation matches your password.",
        variant: "destructive",
      })
      return
    }

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
            ? "Your account is pending admin approval. Please log in to track updates."
            : "Account created! Please log in to continue.",
      })
      router.push("/auth/login")
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
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
          Create Account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Join our inclusive volunteer community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Email
              </Label>
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                aria-required="true"
              />
              <p className="text-xs text-muted-foreground">
                At least 6 characters, including letters and numbers.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onFocus={() => setConfirmTouched(true)}
                onChange={(e) => {
                  setConfirmTouched(true)
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }}
                required
                aria-required="true"
              />
              {passwordsMatch && <p className="text-xs text-emerald-600">Passwords match</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              I am a...
            </Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
              <SelectTrigger id="role" aria-label="Select your role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "volunteer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="skills" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Skills (comma separated)
                </Label>
                <Input
                  id="skills"
                  placeholder="e.g., Teaching, Communication, Technology"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Availability
                </Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Evenings, Full-time"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabilityStatus" className="flex items-center gap-2">
                  <Accessibility className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Disability Status (optional)
                </Label>
                <Input
                  id="disabilityStatus"
                  placeholder="e.g., Visual impairment, Mobility impairment"
                  value={formData.disabilityStatus}
                  onChange={(e) => setFormData({ ...formData, disabilityStatus: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessibilityNeeds" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Accessibility Needs (comma separated, optional)
                </Label>
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
                <Label htmlFor="orgName" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Organization Name
                </Label>
                <Input
                  id="orgName"
                  placeholder="Your Organization Name"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  required={formData.role === "organization"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactInfo" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Contact Information
                </Label>
                <Input
                  id="contactInfo"
                  placeholder="Phone number or additional email"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Organization Description
                </Label>
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
