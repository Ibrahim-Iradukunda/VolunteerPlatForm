"use client"

import { useState, useMemo, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"
import { OpportunityCard } from "@/components/opportunity-card"
import { OpportunityFilters } from "@/components/opportunity-filters"
import type { Opportunity } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { SearchX, Sparkles } from "lucide-react"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [accessibilityFilters, setAccessibilityFilters] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const params = new URLSearchParams()
        params.append("status", "approved")
        if (searchQuery) params.append("search", searchQuery)
        if (typeFilter !== "all") params.append("type", typeFilter)
        if (locationFilter) params.append("location", locationFilter)

        const response = await fetch(`/api/opportunities?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const apiOpportunities = data.opportunities || []

          // Transform API response to match Opportunity type
          const transformedOpportunities: Opportunity[] = apiOpportunities.map((opp: any) => {
            const oppId = opp.id || opp._id
            return {
              id: oppId,
              _id: oppId, // Ensure both id and _id are set to the same value
              organizationId: opp.organizationId?._id || opp.organizationId,
              organizationName: opp.organizationName,
              title: opp.title,
              description: opp.description,
              requirements: opp.requirements || [],
              location: opp.location,
              type: opp.type,
              accessibilityFeatures: opp.accessibilityFeatures || [],
              skills: opp.skills || [],
              status: opp.status,
              applications: opp.applications || 0,
              createdAt: opp.createdAt,
              updatedAt: opp.updatedAt,
            }
          })

          // Only update if data actually changed
          setOpportunities((prev) => {
            const prevIds = new Set(prev.map((o) => o.id || o._id).sort())
            const newIds = new Set(transformedOpportunities.map((o) => o.id || o._id).sort())
            if (prevIds.size !== newIds.size || [...prevIds].some((id) => !newIds.has(id))) {
              return transformedOpportunities
            }
            return prev
          })
        }
      } catch (error) {
        console.error("Error loading opportunities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunities()
    // Only refresh on window focus, not automatically
    const handleFocus = () => {
      loadOpportunities()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [searchQuery, typeFilter, locationFilter])

  const approvedOpportunities = useMemo(() => {
    return opportunities.filter((opp) => opp.status === "approved")
  }, [opportunities])

  const filteredOpportunities = useMemo(() => {
    return approvedOpportunities.filter((opp) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = typeFilter === "all" || opp.type === typeFilter

      // Location filter
      const matchesLocation =
        locationFilter === "" || opp.location.toLowerCase().includes(locationFilter.toLowerCase())

      // Accessibility filters
      const matchesAccessibility =
        accessibilityFilters.length === 0 ||
        accessibilityFilters.every((filter) =>
          opp.accessibilityFeatures.some((feature) => feature.toLowerCase().includes(filter.toLowerCase())),
        )

      return matchesSearch && matchesType && matchesLocation && matchesAccessibility
    })
  }, [approvedOpportunities, searchQuery, typeFilter, locationFilter, accessibilityFilters])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        <section id="opportunities" className="py-20 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Discover Opportunities</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Available Opportunities</h2>
              <p className="text-lg text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredOpportunities.length}</span> of{" "}
                <span className="font-semibold text-foreground">{approvedOpportunities.length}</span> opportunities
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
                  <OpportunityFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    accessibilityFilters={accessibilityFilters}
                    setAccessibilityFilters={setAccessibilityFilters}
                  />
                </div>
              </aside>

              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="h-full">
                        <CardContent className="p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <Skeleton className="h-10 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredOpportunities.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredOpportunities.map((opportunity) => (
                      <OpportunityCard key={opportunity.id || opportunity._id} opportunity={opportunity} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <SearchX className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No opportunities found</h3>
                        <p className="text-muted-foreground max-w-md">
                          No opportunities match your filters. Try adjusting your search criteria or check back later
                          for new opportunities.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
