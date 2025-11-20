import type { Opportunity, Application } from "./types"

export const mockOpportunities: Opportunity[] = []

export function getOpportunities(): Opportunity[] {
  // Guard against SSR - localStorage is only available in the browser
  if (typeof window === "undefined") {
    return []
  }

  const stored = localStorage.getItem("opportunities")
  let opportunities: Opportunity[]
  
  if (stored) {
    opportunities = JSON.parse(stored)
  } else {
    localStorage.setItem("opportunities", JSON.stringify([]))
    opportunities = []
  }

  // Calculate real application counts from actual applications
  const applications = getApplications()
  const opportunitiesWithCounts = opportunities.map((opp) => {
    const opportunityId = opp.id || (opp as any)._id
    const applicationCount = applications.filter((app) => {
      const appOpportunityId = app.opportunityId?._id || app.opportunityId
      return appOpportunityId === opportunityId
    }).length
    
    return {
      ...opp,
      applications: applicationCount,
    }
  })

  return opportunitiesWithCounts
}

export function saveOpportunities(opportunities: Opportunity[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("opportunities", JSON.stringify(opportunities))
}

export function getApplications(): Application[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("applications")
  return stored ? JSON.parse(stored) : []
}

export function saveApplications(applications: Application[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("applications", JSON.stringify(applications))
}
