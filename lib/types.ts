export type UserRole = "volunteer" | "organization" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface Volunteer extends User {
  role: "volunteer"
  disabilityStatus?: string
  skills: string[]
  availability: string
  accessibilityNeeds: string[]
}

export interface Organization extends User {
  role: "organization"
  orgName: string
  contactInfo: string
  description: string
  verified: boolean
}

export interface Admin extends User {
  role: "admin"
}

export interface Opportunity {
  id?: string
  _id?: string
  organizationId: string
  organizationName: string
  title: string
  description: string
  requirements: string[]
  location: string
  type: "onsite" | "remote" | "hybrid"
  accessibilityFeatures: string[]
  skills: string[]
  status: "pending" | "approved" | "rejected"
  createdAt: Date | string
  applications: number
}

export interface Application {
  id: string
  volunteerId: string
  volunteerName: string
  opportunityId: string
  opportunityTitle: string
  status: "pending" | "accepted" | "rejected"
  appliedAt: Date
  message: string
}
