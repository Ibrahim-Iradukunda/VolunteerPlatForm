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
    confirmPassword: "",
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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters")
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Password must contain at least one letter")
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password
    const passwordValidationErrors = validatePassword(formData.password)
    setPasswordErrors(passwordValidationErrors)
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      setIsLoading(false)
      return
    } else {
      setConfirmPasswordError("")
    }
    
    // Check if password validation passed
    if (passwordValidationErrors.length > 0) {
      setIsLoading(false)
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
                  placeholder="Enter your name"
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
                onChange={(e) => {
                  const newPassword = e.target.value
                  setFormData({ ...formData, password: newPassword })
                  setPasswordErrors(validatePassword(newPassword))
                  // Clear confirm password error if passwords match
                  if (newPassword === formData.confirmPassword) {
                    setConfirmPasswordError("")
                  }
                }}
                required
                aria-required="true"
                className={passwordErrors.length > 0 ? "border-destructive" : ""}
              />
              {passwordErrors.length > 0 && (
                <ul className="text-sm text-destructive space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters and contain both letters and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  const newConfirmPassword = e.target.value
                  setFormData({ ...formData, confirmPassword: newConfirmPassword })
                  if (newConfirmPassword && newConfirmPassword !== formData.password) {
                    setConfirmPasswordError("Passwords do not match")
                  } else {
                    setConfirmPasswordError("")
                  }
                }}
                required
                aria-required="true"
                className={confirmPasswordError ? "border-destructive" : ""}
              />
              {confirmPasswordError && (
                <p className="text-sm text-destructive">{confirmPasswordError}</p>
              )}
            </div>
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
