"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { AdminOrganizations } from "@/components/dashboard/admin-organizations"
import { AdminOpportunities } from "@/components/dashboard/admin-opportunities"
import { AdminApplications } from "@/components/dashboard/admin-applications"
import { AdminUsers } from "@/components/dashboard/admin-users"
import { Loader2 } from "lucide-react"

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage directly as fallback
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role === "admin") {
          setIsLoading(false)
          return
        }
      } catch {
        // Invalid user data
      }
    }

    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <AdminApplications />
            </TabsContent>

            <TabsContent value="organizations" className="space-y-6">
              <AdminOrganizations />
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <AdminOpportunities />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUsers />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

