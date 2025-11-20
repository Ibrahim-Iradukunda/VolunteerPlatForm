"use client"

import { useState, useMemo, useEffect } from "react"
import { OpportunityCard } from "@/components/opportunity-card"
import { OpportunityFilters } from "@/components/opportunity-filters"
import type { Opportunity } from "@/lib/types"

export function VolunteerBrowse() {
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading opportunities...</p>
            </div>
          ) : filteredOpportunities.length > 0 ? (
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
