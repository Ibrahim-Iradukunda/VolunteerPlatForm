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
import { ClipboardList, LayoutDashboard, Loader2, Search } from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== "volunteer") {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <VolunteerOverview />
            </TabsContent>

            <TabsContent value="browse" className="space-y-6">
              <VolunteerBrowse />
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <VolunteerApplications />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
