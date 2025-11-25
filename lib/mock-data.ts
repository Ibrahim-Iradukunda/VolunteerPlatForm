import type { Opportunity, Application } from "./types"
import { generateId } from "@/lib/utils/id"

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

// Likes storage helpers
type StoredLike = {
  opportunityId: string
  userId: string
}

const LIKES_STORAGE_KEY = "opportunityLikes"

function readLikes(): StoredLike[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(LIKES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function writeLikes(likes: StoredLike[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes))
}

export function getOpportunityLikeStats(opportunityId: string, userId?: string) {
  const likes = readLikes().filter((like) => like.opportunityId === opportunityId)
  return {
    likesCount: likes.length,
    isLiked: userId ? likes.some((like) => like.opportunityId === opportunityId && like.userId === userId) : false,
  }
}

export function toggleOpportunityLike(opportunityId: string, userId: string) {
  let likes = readLikes()
  const existingIndex = likes.findIndex((like) => like.opportunityId === opportunityId && like.userId === userId)

  if (existingIndex >= 0) {
    likes.splice(existingIndex, 1)
  } else {
    likes.push({ opportunityId, userId })
  }

  writeLikes(likes)

  const stats = getOpportunityLikeStats(opportunityId, userId)
  return {
    liked: stats.isLiked,
    likesCount: stats.likesCount,
  }
}

// Comments storage helpers
type StoredComment = {
  id: string
  opportunityId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

const COMMENTS_STORAGE_KEY = "opportunityComments"

function readComments(): StoredComment[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(COMMENTS_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function writeComments(comments: StoredComment[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments))
}

export function getOpportunityComments(opportunityId: string): StoredComment[] {
  return readComments()
    .filter((comment) => comment.opportunityId === opportunityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addOpportunityComment({
  opportunityId,
  userId,
  userName,
  content,
}: {
  opportunityId: string
  userId: string
  userName: string
  content: string
}) {
  const newComment: StoredComment = {
    id: generateId(),
    opportunityId,
    userId,
    userName,
    content,
    createdAt: new Date().toISOString(),
  }

  const comments = [newComment, ...readComments()]
  writeComments(comments)
  return newComment
}
