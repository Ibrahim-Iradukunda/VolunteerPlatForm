import type { Opportunity, Application } from "./types"

export const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    organizationId: "org1",
    organizationName: "African Youth Foundation",
    title: "Community Health Education Volunteer",
    description:
      "Help educate communities about health and wellness practices. This role involves creating educational materials and conducting workshops.",
    requirements: [
      "Good communication skills",
      "Interest in public health",
      "Ability to work with diverse communities",
    ],
    location: "Kigali, Rwanda",
    type: "onsite",
    accessibilityFeatures: ["Wheelchair accessible", "Sign language support available", "Flexible schedule"],
    skills: ["Communication", "Public Speaking", "Health Education"],
    status: "approved",
    createdAt: new Date("2025-01-15"),
    applications: 0, // Will be calculated dynamically by getOpportunities()
  },
  {
    id: "2",
    organizationId: "org2",
    organizationName: "Tech for All Initiative",
    title: "Remote Digital Literacy Trainer",
    description:
      "Teach basic computer skills and internet safety to youth in rural communities through online sessions.",
    requirements: ["Computer proficiency", "Teaching experience preferred", "Patience and empathy"],
    location: "Remote",
    type: "remote",
    accessibilityFeatures: ["Fully remote", "Flexible hours", "Screen reader compatible materials"],
    skills: ["Teaching", "Technology", "Communication"],
    status: "approved",
    createdAt: new Date("2025-01-20"),
    applications: 0, // Will be calculated dynamically by getOpportunities()
  },
  {
    id: "3",
    organizationId: "org1",
    organizationName: "African Youth Foundation",
    title: "Environmental Conservation Assistant",
    description:
      "Support environmental conservation projects including tree planting, waste management education, and community clean-up initiatives.",
    requirements: ["Physical ability for outdoor work", "Environmental awareness", "Team player"],
    location: "Nairobi, Kenya",
    type: "onsite",
    accessibilityFeatures: ["Transportation provided", "Adaptive equipment available"],
    skills: ["Environmental Science", "Community Engagement", "Project Management"],
    status: "approved",
    createdAt: new Date("2025-01-25"),
    applications: 0, // Will be calculated dynamically by getOpportunities()
  },
  {
    id: "4",
    organizationId: "org3",
    organizationName: "Inclusive Education Network",
    title: "Peer Mentor for Students with Disabilities",
    description:
      "Provide mentorship and support to students with disabilities in their academic journey. Share experiences and offer guidance.",
    requirements: ["Personal experience with disability", "Good listening skills", "Empathy and patience"],
    location: "Accra, Ghana",
    type: "hybrid",
    accessibilityFeatures: ["Wheelchair accessible", "Flexible meeting options", "Remote participation available"],
    skills: ["Mentoring", "Communication", "Empathy"],
    status: "approved",
    createdAt: new Date("2025-02-01"),
    applications: 0, // Will be calculated dynamically by getOpportunities()
  },
  {
    id: "5",
    organizationId: "org2",
    organizationName: "Tech for All Initiative",
    title: "Social Media Content Creator",
    description: "Create engaging social media content to promote digital inclusion and accessibility awareness.",
    requirements: ["Social media experience", "Creative writing", "Basic graphic design skills"],
    location: "Remote",
    type: "remote",
    accessibilityFeatures: ["Fully remote", "Flexible deadlines", "Accessible design tools provided"],
    skills: ["Content Creation", "Social Media", "Graphic Design"],
    status: "approved",
    createdAt: new Date("2025-02-05"),
    applications: 0, // Will be calculated dynamically by getOpportunities()
  },
]

export function getOpportunities(): Opportunity[] {
  // Guard against SSR - localStorage is only available in the browser
  if (typeof window === "undefined") {
    return mockOpportunities
  }

  const stored = localStorage.getItem("opportunities")
  let opportunities: Opportunity[]
  
  if (stored) {
    opportunities = JSON.parse(stored)
  } else {
    localStorage.setItem("opportunities", JSON.stringify(mockOpportunities))
    opportunities = mockOpportunities
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
