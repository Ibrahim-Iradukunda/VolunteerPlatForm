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
import { User, Building2, Mail, Lock, UserCircle, Briefcase, Calendar, Heart, Phone, FileText, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 6) {
      errors.push("At least 6 characters")
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Contains letters")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Contains numbers")
    }
    return errors
  }

  // Check if password meets all requirements
  const isPasswordValid = (password: string): boolean => {
    return validatePassword(password).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password
    const passwordValidationErrors = validatePassword(formData.password)
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors)
      toast({
        title: "Password validation failed",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      })
      return
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same",
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
            ? "Your account is pending admin approval. Please log in to continue."
            : "Welcome! Please log in to continue.",
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
    <Card className="w-full max-w-2xl border-2 shadow-xl">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base mt-1">Join our inclusive volunteer community</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                aria-required="true"
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                aria-required="true"
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => {
                  const newPassword = e.target.value
                  setFormData({ ...formData, password: newPassword })
                  setPasswordErrors(validatePassword(newPassword))
                }}
                required
                aria-required="true"
                className={cn(
                  "h-11 transition-all focus:ring-2 focus:ring-primary/20",
                  passwordErrors.length > 0 && formData.password.length > 0 && "border-destructive"
                )}
              />
              {formData.password.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                  <ul className="text-xs space-y-0.5">
                    <li className={cn(
                      "flex items-center gap-1.5",
                      formData.password.length >= 6 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      <span>{formData.password.length >= 6 ? "✓" : "○"}</span>
                      <span>At least 6 characters</span>
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[a-zA-Z]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      <span>{/[a-zA-Z]/.test(formData.password) ? "✓" : "○"}</span>
                      <span>Contains letters</span>
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[0-9]/.test(formData.password) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      <span>{/[0-9]/.test(formData.password) ? "✓" : "○"}</span>
                      <span>Contains numbers</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                aria-required="true"
                className={cn(
                  "h-11 transition-all focus:ring-2 focus:ring-primary/20",
                  formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && "border-destructive"
                )}
              />
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600 dark:text-green-400">Passwords match</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                I am a...
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role" aria-label="Select your role" className="h-11">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Volunteer
                  </SelectItem>
                  <SelectItem value="organization" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organization
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role === "volunteer" && (
            <div className="space-y-4 p-6 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in-50 slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Volunteer Information</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Skills
                  </Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Teaching, Communication, Leadership"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </Label>
                  <Input
                    id="availability"
                    placeholder="e.g., Weekends, Evenings, Flexible"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="disabilityStatus" className="text-sm font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Disability Status (optional)
                  </Label>
                  <Input
                    id="disabilityStatus"
                    placeholder="Optional - Share if comfortable"
                    value={formData.disabilityStatus}
                    onChange={(e) => setFormData({ ...formData, disabilityStatus: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessibilityNeeds" className="text-sm font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Accessibility Needs (optional)
                  </Label>
                  <Input
                    id="accessibilityNeeds"
                    placeholder="e.g., Wheelchair access, Sign language"
                    value={formData.accessibilityNeeds}
                    onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple needs with commas</p>
                </div>
              </div>
            </div>
          )}

          {formData.role === "organization" && (
            <div className="space-y-4 p-6 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in-50 slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Organization Information</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organization Name
                  </Label>
                  <Input
                    id="orgName"
                    placeholder="Enter your organization's name"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    required={formData.role === "organization"}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactInfo" className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </Label>
                  <Input
                    id="contactInfo"
                    placeholder="Phone, email, or other contact details"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Organization Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your organization, mission, and goals..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">This will help volunteers understand your organization better</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading || !formData.role || !isPasswordValid(formData.password) || formData.password !== formData.confirmPassword}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Account
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
