import { getDB } from "./connect"
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

export function createApplication(applicationData: IApplicationInput): IApplication {
  const db = getDB()
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

  db.prepare(`
    INSERT INTO applications (
      id, volunteerId, volunteerName, opportunityId, opportunityTitle, status, message, appliedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    application.id,
    application.volunteerId,
    application.volunteerName,
    application.opportunityId,
    application.opportunityTitle,
    application.status,
    application.message,
    application.appliedAt
  )

  return application
}

export function findApplicationById(id: string): IApplication | null {
  const db = getDB()
  const row = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as any
  
  if (!row) return null
  
  return row
}

export function findApplicationByVolunteerAndOpportunity(volunteerId: string, opportunityId: string): IApplication | null {
  const db = getDB()
  const row = db.prepare(`
    SELECT * FROM applications 
    WHERE volunteerId = ? AND opportunityId = ?
  `).get(volunteerId, opportunityId) as any
  
  if (!row) return null
  
  return row
}

export function findApplications(query: {
  volunteerId?: string
  opportunityId?: string
  organizationId?: string
  status?: string
}): IApplication[] {
  const db = getDB()
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

  const rows = db.prepare(sql).all(...params) as any[]
  
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

export function countApplicationsByOpportunity(opportunityId: string): number {
  const db = getDB()
  const result = db.prepare("SELECT COUNT(*) as count FROM applications WHERE opportunityId = ?").get(opportunityId) as { count: number }
  return result.count
}

export function updateApplication(id: string, updates: { status?: "pending" | "accepted" | "rejected" }): IApplication | null {
  const db = getDB()
  const application = findApplicationById(id)
  if (!application) return null

  if (updates.status) {
    db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(updates.status, id)
  }

  return findApplicationById(id)
}

export function deleteApplication(id: string): boolean {
  const db = getDB()
  const result = db.prepare("DELETE FROM applications WHERE id = ?").run(id)
  return result.changes > 0
}

export function deleteApplicationsByOpportunity(opportunityId: string): number {
  const db = getDB()
  const result = db.prepare("DELETE FROM applications WHERE opportunityId = ?").run(opportunityId)
  return result.changes
}

export function deleteApplicationsByVolunteer(volunteerId: string): number {
  const db = getDB()
  const result = db.prepare("DELETE FROM applications WHERE volunteerId = ?").run(volunteerId)
  return result.changes
}

