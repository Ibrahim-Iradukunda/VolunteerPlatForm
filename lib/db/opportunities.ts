import { getDB } from "./connect"
import { generateId } from "@/lib/utils/id"

export interface IOpportunity {
  id: string
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
  applications: number
  createdAt: string
  updatedAt: string
}

export interface IOpportunityInput {
  organizationId: string
  organizationName: string
  title: string
  description: string
  requirements?: string[]
  location: string
  type: "onsite" | "remote" | "hybrid"
  accessibilityFeatures?: string[]
  skills?: string[]
  status?: "pending" | "approved" | "rejected"
}

export function createOpportunity(opportunityData: IOpportunityInput): IOpportunity {
  const db = getDB()
  const id = generateId()
  const now = new Date().toISOString()
  
  const opportunity: IOpportunity = {
    id,
    organizationId: opportunityData.organizationId,
    organizationName: opportunityData.organizationName,
    title: opportunityData.title,
    description: opportunityData.description,
    requirements: opportunityData.requirements || [],
    location: opportunityData.location,
    type: opportunityData.type,
    accessibilityFeatures: opportunityData.accessibilityFeatures || [],
    skills: opportunityData.skills || [],
    status: opportunityData.status || "pending",
    applications: 0,
    createdAt: now,
    updatedAt: now,
  }

  db.prepare(`
    INSERT INTO opportunities (
      id, organizationId, organizationName, title, description, requirements,
      location, type, accessibilityFeatures, skills, status, applications, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    opportunity.id,
    opportunity.organizationId,
    opportunity.organizationName,
    opportunity.title,
    opportunity.description,
    JSON.stringify(opportunity.requirements),
    opportunity.location,
    opportunity.type,
    JSON.stringify(opportunity.accessibilityFeatures),
    JSON.stringify(opportunity.skills),
    opportunity.status,
    opportunity.applications,
    opportunity.createdAt,
    opportunity.updatedAt
  )

  return opportunity
}

export function findOpportunityById(id: string): IOpportunity | null {
  const db = getDB()
  const row = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id) as any
  
  if (!row) return null
  
  return {
    ...row,
    requirements: JSON.parse(row.requirements || "[]"),
    accessibilityFeatures: JSON.parse(row.accessibilityFeatures || "[]"),
    skills: JSON.parse(row.skills || "[]"),
  }
}

export function findOpportunities(query: {
  search?: string
  type?: string
  location?: string
  accessibility?: string
  status?: string
  organizationId?: string
}): IOpportunity[] {
  const db = getDB()
  let sql = "SELECT * FROM opportunities WHERE 1=1"
  const params: any[] = []

  if (query.status && query.status !== "all") {
    sql += " AND status = ?"
    params.push(query.status)
  }

  if (query.organizationId) {
    sql += " AND organizationId = ?"
    params.push(query.organizationId)
  }

  if (query.type && query.type !== "all") {
    sql += " AND type = ?"
    params.push(query.type)
  }

  if (query.location) {
    sql += " AND location LIKE ?"
    params.push(`%${query.location}%`)
  }

  if (query.search) {
    sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR organizationName LIKE ?)"
    const searchTerm = `%${query.search}%`
    params.push(searchTerm, searchTerm, searchTerm, searchTerm)
  }

  // Note: accessibilityFeatures filtering would require JSON parsing, simplified here
  if (query.accessibility) {
    sql += " AND accessibilityFeatures LIKE ?"
    params.push(`%${query.accessibility}%`)
  }

  sql += " ORDER BY createdAt DESC"

  const rows = db.prepare(sql).all(...params) as any[]
  
  return rows.map(row => ({
    ...row,
    requirements: JSON.parse(row.requirements || "[]"),
    accessibilityFeatures: JSON.parse(row.accessibilityFeatures || "[]"),
    skills: JSON.parse(row.skills || "[]"),
  }))
}

export function updateOpportunity(id: string, updates: Partial<IOpportunityInput>): IOpportunity | null {
  const db = getDB()
  const opportunity = findOpportunityById(id)
  if (!opportunity) return null

  const fields: string[] = []
  const values: any[] = []

  if (updates.title !== undefined) {
    fields.push("title = ?")
    values.push(updates.title)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description)
  }
  if (updates.requirements !== undefined) {
    fields.push("requirements = ?")
    values.push(JSON.stringify(updates.requirements))
  }
  if (updates.location !== undefined) {
    fields.push("location = ?")
    values.push(updates.location)
  }
  if (updates.type !== undefined) {
    fields.push("type = ?")
    values.push(updates.type)
  }
  if (updates.accessibilityFeatures !== undefined) {
    fields.push("accessibilityFeatures = ?")
    values.push(JSON.stringify(updates.accessibilityFeatures))
  }
  if (updates.skills !== undefined) {
    fields.push("skills = ?")
    values.push(JSON.stringify(updates.skills))
  }
  if (updates.status !== undefined) {
    fields.push("status = ?")
    values.push(updates.status)
  }

  if (fields.length === 0) return opportunity

  fields.push("updatedAt = ?")
  values.push(new Date().toISOString())
  values.push(id)

  db.prepare(`UPDATE opportunities SET ${fields.join(", ")} WHERE id = ?`).run(...values)
  
  return findOpportunityById(id)
}

export function deleteOpportunity(id: string): boolean {
  const db = getDB()
  const result = db.prepare("DELETE FROM opportunities WHERE id = ?").run(id)
  return result.changes > 0
}

export function updateOpportunityApplicationCount(opportunityId: string): number {
  const db = getDB()
  const count = db.prepare("SELECT COUNT(*) as count FROM applications WHERE opportunityId = ?").get(opportunityId) as { count: number }
  const applicationCount = count.count
  
  db.prepare("UPDATE opportunities SET applications = ? WHERE id = ?").run(applicationCount, opportunityId)
  
  return applicationCount
}

