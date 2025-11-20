import connectDB from "./connect"
import { generateId } from "@/lib/utils/id"

export interface IApplication {
  id: string
  volunteerId: string
  volunteerName: string
  opportunityId: string
  opportunityTitle: string
  status: "pending" | "accepted" | "rejected"
  message: string
  appliedAt: string
}

export interface IApplicationInput {
  volunteerId: string
  volunteerName: string
  opportunityId: string
  opportunityTitle: string
  message?: string
  status?: "pending" | "accepted" | "rejected"
}

export async function createApplication(applicationData: IApplicationInput): Promise<IApplication> {
  const db = await connectDB()
  const id = generateId()
  const now = new Date().toISOString()
  
  const application: IApplication = {
    id,
    volunteerId: applicationData.volunteerId,
    volunteerName: applicationData.volunteerName,
    opportunityId: applicationData.opportunityId,
    opportunityTitle: applicationData.opportunityTitle,
    status: applicationData.status || "pending",
    message: applicationData.message || "",
    appliedAt: now,
  }

  await db.execute({
    sql: `
      INSERT INTO applications (
        id, volunteerId, volunteerName, opportunityId, opportunityTitle, status, message, appliedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      application.id,
      application.volunteerId,
      application.volunteerName,
      application.opportunityId,
      application.opportunityTitle,
      application.status,
      application.message,
      application.appliedAt,
    ],
  })

  return application
}

export async function findApplicationById(id: string): Promise<IApplication | null> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "SELECT * FROM applications WHERE id = ?",
    args: [id],
  })
  return (result.rows[0] as any) ?? null
}

export async function findApplicationByVolunteerAndOpportunity(volunteerId: string, opportunityId: string): Promise<IApplication | null> {
  const db = await connectDB()
  const result = await db.execute({
    sql: `
      SELECT * FROM applications 
      WHERE volunteerId = ? AND opportunityId = ?
    `,
    args: [volunteerId, opportunityId],
  })
  return (result.rows[0] as any) ?? null
}

export async function findApplications(query: {
  volunteerId?: string
  opportunityId?: string
  organizationId?: string
  status?: string
}): Promise<IApplication[]> {
  const db = await connectDB()
  let sql = `
    SELECT a.*, u.email as volunteerEmail, o.title as opportunityTitle, o.organizationName
    FROM applications a
    LEFT JOIN users u ON a.volunteerId = u.id
    LEFT JOIN opportunities o ON a.opportunityId = o.id
    WHERE 1=1
  `
  const params: any[] = []

  if (query.volunteerId) {
    sql += " AND a.volunteerId = ?"
    params.push(query.volunteerId)
  }

  if (query.opportunityId) {
    sql += " AND a.opportunityId = ?"
    params.push(query.opportunityId)
  }

  if (query.organizationId) {
    sql += " AND o.organizationId = ?"
    params.push(query.organizationId)
  }

  if (query.status) {
    sql += " AND a.status = ?"
    params.push(query.status)
  }

  sql += " ORDER BY a.appliedAt DESC"

  const result = await db.execute({ sql, args: params })
  const rows = result.rows as any[]
  
  return rows.map(row => ({
    id: row.id,
    volunteerId: row.volunteerId,
    volunteerName: row.volunteerName,
    opportunityId: row.opportunityId,
    opportunityTitle: row.opportunityTitle,
    status: row.status,
    message: row.message,
    appliedAt: row.appliedAt,
  }))
}

export async function countApplicationsByOpportunity(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM applications WHERE opportunityId = ?",
    args: [opportunityId],
  })
  const row = result.rows[0] as { count: number }
  return Number(row?.count ?? 0)
}

export async function updateApplication(id: string, updates: { status?: "pending" | "accepted" | "rejected" }): Promise<IApplication | null> {
  const db = await connectDB()
  const application = await findApplicationById(id)
  if (!application) return null

  if (updates.status) {
    await db.execute({
      sql: "UPDATE applications SET status = ? WHERE id = ?",
      args: [updates.status, id],
    })
  }

  return findApplicationById(id)
}

export async function deleteApplication(id: string): Promise<boolean> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM applications WHERE id = ?",
    args: [id],
  })
  return (result.rowsAffected ?? 0) > 0
}

export async function deleteApplicationsByOpportunity(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM applications WHERE opportunityId = ?",
    args: [opportunityId],
  })
  return result.rowsAffected ?? 0
}

export async function deleteApplicationsByVolunteer(volunteerId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM applications WHERE volunteerId = ?",
    args: [volunteerId],
  })
  return result.rowsAffected ?? 0
}


