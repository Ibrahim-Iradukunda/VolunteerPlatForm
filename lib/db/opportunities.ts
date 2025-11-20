import connectDB from "./connect"
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

function mapOpportunityRow(row: any): IOpportunity {
  return {
    ...row,
    requirements: JSON.parse(row.requirements || "[]"),
    accessibilityFeatures: JSON.parse(row.accessibilityFeatures || "[]"),
    skills: JSON.parse(row.skills || "[]"),
  }
}

export async function createOpportunity(opportunityData: IOpportunityInput): Promise<IOpportunity> {
  const db = await connectDB()
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

  await db.execute({
    sql: `
      INSERT INTO opportunities (
        id, organizationId, organizationName, title, description, requirements,
        location, type, accessibilityFeatures, skills, status, applications, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      opportunity.updatedAt,
    ],
  })

  return opportunity
}

export async function findOpportunityById(id: string): Promise<IOpportunity | null> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "SELECT * FROM opportunities WHERE id = ?",
    args: [id],
  })
  const row = result.rows[0] as any
  if (!row) return null
  return mapOpportunityRow(row)
}

export async function findOpportunities(query: {
  search?: string
  type?: string
  location?: string
  accessibility?: string
  status?: string
  organizationId?: string
}): Promise<IOpportunity[]> {
  const db = await connectDB()
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

  const result = await db.execute({
    sql,
    args: params,
  })
  const rows = result.rows as any[]
  
  return rows.map(mapOpportunityRow)
}

export async function updateOpportunity(id: string, updates: Partial<IOpportunityInput>): Promise<IOpportunity | null> {
  const db = await connectDB()
  const opportunity = await findOpportunityById(id)
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

  await db.execute({
    sql: `UPDATE opportunities SET ${fields.join(", ")} WHERE id = ?`,
    args: values,
  })
  
  return findOpportunityById(id)
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM opportunities WHERE id = ?",
    args: [id],
  })
  return (result.rowsAffected ?? 0) > 0
}

export async function updateOpportunityApplicationCount(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const countResult = await db.execute({
    sql: "SELECT COUNT(*) as count FROM applications WHERE opportunityId = ?",
    args: [opportunityId],
  })
  const countRow = countResult.rows[0] as { count: number }
  const applicationCount = Number(countRow?.count ?? 0)
  
  await db.execute({
    sql: "UPDATE opportunities SET applications = ? WHERE id = ?",
    args: [applicationCount, opportunityId],
  })
  
  return applicationCount
}

