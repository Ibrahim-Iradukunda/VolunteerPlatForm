"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VolunteerOverview } from "@/components/dashboard/volunteer-overview"
import { VolunteerApplications } from "@/components/dashboard/volunteer-applications"
import { VolunteerBrowse } from "@/components/dashboard/volunteer-browse"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.role === "organization") {
      router.push("/dashboard/organization")
    } else if (user?.role === "admin") {
      router.push("/dashboard/admin")
    } else {
      setIsLoading(false)

      // Check if there's an apply parameter
      const applyId = searchParams.get("apply")
      if (applyId) {
        setActiveTab("browse")
      }
    }
  }, [isAuthenticated, user, router, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== "volunteer") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-muted/50">
              <TabsTrigger value="overview" className="text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="browse" className="text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Browse
              </TabsTrigger>
              <TabsTrigger value="applications" className="text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <VolunteerOverview />
            </TabsContent>

            <TabsContent value="browse" className="space-y-6 mt-6">
              <VolunteerBrowse />
            </TabsContent>

            <TabsContent value="applications" className="space-y-6 mt-6">
              <VolunteerApplications />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
