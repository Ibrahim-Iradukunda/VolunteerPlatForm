"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { generateId } from "@/lib/utils/id"

export default function CreateAdminPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get existing users from localStorage
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]")

      // Check if user already exists
      const existingUser = mockUsers.find((u: any) => u.email === email)
      if (existingUser) {
        toast({
          title: "User already exists",
          description: "A user with this email already exists.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create admin user
      const adminUser = {
        id: generateId(),
        email: email,
        password: password, // In production, this should be hashed
        name: name,
        role: "admin" as const,
        createdAt: new Date().toISOString(),
        verified: true,
      }

      // Add to localStorage
      mockUsers.push(adminUser)
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers))

      toast({
        title: "Admin user created!",
        description: `Admin user "${email}" has been created successfully. You can now log in.`,
      })

      // Clear form
      setEmail("")
      setPassword("")
      setName("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create admin user.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Admin User</CardTitle>
              <CardDescription>
                Create an admin user account that will be stored in localStorage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder=""
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Admin User"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> After creating an admin user, you can log in at{" "}
                  <a href="/auth/login" className="text-primary underline">
                    /auth/login
                  </a>{" "}
                  and access the admin dashboard at{" "}
                  <a href="/dashboard/admin" className="text-primary underline">
                    /dashboard/admin
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}



