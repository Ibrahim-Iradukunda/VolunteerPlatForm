"use client"

import { useState, useMemo, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"
import { OpportunityCard } from "@/components/opportunity-card"
import { OpportunityFilters } from "@/components/opportunity-filters"
import type { Opportunity } from "@/lib/types"
import { getOpportunities } from "@/lib/mock-data"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [accessibilityFilters, setAccessibilityFilters] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getOpportunities())

  useEffect(() => {
    const loadOpportunities = () => {
      // getOpportunities() now calculates application counts dynamically from actual applications
      setOpportunities(getOpportunities())
    }

    loadOpportunities()
    window.addEventListener("focus", loadOpportunities)
    // Refresh every 2 seconds to get real-time application count updates
    const interval = setInterval(loadOpportunities, 2000)

    return () => {
      window.removeEventListener("focus", loadOpportunities)
      clearInterval(interval)
    }
  }, [])

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
      const matchesLocation = locationFilter === "" || opp.location.toLowerCase().includes(locationFilter.toLowerCase())

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

        <section id="opportunities" className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Available Opportunities</h2>
              <p className="text-muted-foreground">
                Showing {filteredOpportunities.length} of {approvedOpportunities.length} opportunities
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
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
              </aside>

              <div className="lg:col-span-3">
                {filteredOpportunities.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredOpportunities.map((opportunity) => (
                      <OpportunityCard key={opportunity.id || opportunity._id} opportunity={opportunity} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No opportunities match your filters. Try adjusting your search criteria.
                    </p>
                  </div>
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
