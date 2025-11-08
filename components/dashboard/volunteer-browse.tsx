"use client"

import { useState, useMemo, useEffect } from "react"
import { OpportunityCard } from "@/components/opportunity-card"
import { OpportunityFilters } from "@/components/opportunity-filters"
import type { Opportunity } from "@/lib/types"
import { getOpportunities } from "@/lib/mock-data"

export function VolunteerBrowse() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [accessibilityFilters, setAccessibilityFilters] = useState<string[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => getOpportunities())

  useEffect(() => {
    const loadOpportunities = () => {
      setOpportunities(getOpportunities())
    }

    loadOpportunities()
    window.addEventListener("focus", loadOpportunities)
    const interval = setInterval(loadOpportunities, 3000)

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
      const matchesSearch =
        searchQuery === "" ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organizationName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || opp.type === typeFilter

      const matchesLocation = locationFilter === "" || opp.location.toLowerCase().includes(locationFilter.toLowerCase())

      const matchesAccessibility =
        accessibilityFilters.length === 0 ||
        accessibilityFilters.every((filter) =>
          opp.accessibilityFeatures.some((feature) => feature.toLowerCase().includes(filter.toLowerCase())),
        )

      return matchesSearch && matchesType && matchesLocation && matchesAccessibility
    })
  }, [approvedOpportunities, searchQuery, typeFilter, locationFilter, accessibilityFilters])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Browse Opportunities</h2>
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
  )
}
