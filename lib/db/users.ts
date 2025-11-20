import connectDB from "./connect"
import bcrypt from "bcryptjs"
import { generateId } from "@/lib/utils/id"
import { findOpportunities, deleteOpportunity, updateOpportunityApplicationCount } from "./opportunities"
import { findApplications, deleteApplication, deleteApplicationsByOpportunity, deleteApplicationsByVolunteer } from "./applications"
import { deleteCommentsByOpportunity, deleteCommentsByVolunteer } from "./comments"
import { deleteLikesByOpportunity, deleteLikesByUser } from "./likes"

export interface IUser {
  id: string
  email: string
  password: string
  name: string
  role: "volunteer" | "organization" | "admin"
  disabilityStatus?: string
  skills: string[]
  availability?: string
  accessibilityNeeds: string[]
  orgName?: string
  contactInfo?: string
  description?: string
  verified: boolean
  rejected: boolean
  createdAt: string
  updatedAt: string
}

export interface IUserInput {
  email: string
  password: string
  name: string
  role: "volunteer" | "organization" | "admin"
  disabilityStatus?: string
  skills?: string[]
  availability?: string
  accessibilityNeeds?: string[]
  orgName?: string
  contactInfo?: string
  description?: string
  verified?: boolean
  rejected?: boolean
}

function mapUserRow(row: any): IUser {
  return {
    ...row,
    skills: JSON.parse(row.skills || "[]"),
    accessibilityNeeds: JSON.parse(row.accessibilityNeeds || "[]"),
    verified: row.verified === 1,
    rejected: (row.rejected || 0) === 1,
  }
}

export async function createUser(userData: IUserInput): Promise<IUser> {
  const db = await connectDB()
  const id = generateId()
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  
  const now = new Date().toISOString()
  const user: IUser = {
    id,
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    name: userData.name,
    role: userData.role,
    disabilityStatus: userData.disabilityStatus,
    skills: userData.skills || [],
    availability: userData.availability,
    accessibilityNeeds: userData.accessibilityNeeds || [],
    orgName: userData.orgName,
    contactInfo: userData.contactInfo,
    description: userData.description,
    verified: userData.verified || false,
    rejected: userData.rejected || false,
    createdAt: now,
    updatedAt: now,
  }

  await db.execute({
    sql: `
      INSERT INTO users (
        id, email, password, name, role, disabilityStatus, skills, availability,
        accessibilityNeeds, orgName, contactInfo, description, verified, rejected, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      user.id,
      user.email,
      user.password,
      user.name,
      user.role,
      user.disabilityStatus || null,
      JSON.stringify(user.skills),
      user.availability || null,
      JSON.stringify(user.accessibilityNeeds),
      user.orgName || null,
      user.contactInfo || null,
      user.description || null,
      user.verified ? 1 : 0,
      user.rejected ? 1 : 0,
      user.createdAt,
      user.updatedAt,
    ],
  })

  return user
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  })
  const row = result.rows[0] as any
  if (!row) return null
  return mapUserRow(row)
}

export async function findUserById(id: string): Promise<IUser | null> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  })
  const row = result.rows[0] as any
  if (!row) return null
  return mapUserRow(row)
}

export async function findUsers(query: {
  role?: string
  search?: string
}): Promise<IUser[]> {
  const db = await connectDB()
  let sql = "SELECT * FROM users WHERE 1=1"
  const params: any[] = []

  if (query.role && query.role !== "all") {
    sql += " AND role = ?"
    params.push(query.role)
  }

  if (query.search) {
    sql += " AND (name LIKE ? OR email LIKE ? OR orgName LIKE ?)"
    const searchTerm = `%${query.search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }

  sql += " ORDER BY createdAt DESC"

  const result = await db.execute({
    sql,
    args: params,
  })
  const rows = result.rows as any[]
  
  return rows.map(mapUserRow)
}

export async function updateUser(id: string, updates: Partial<IUserInput>): Promise<IUser | null> {
  const db = await connectDB()
  const user = await findUserById(id)
  if (!user) return null

  const fields: string[] = []
  const values: any[] = []

  if (updates.email !== undefined) {
    fields.push("email = ?")
    values.push(updates.email.toLowerCase().trim())
  }
  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.password !== undefined) {
    fields.push("password = ?")
    values.push(bcrypt.hashSync(updates.password, 10))
  }
  if (updates.disabilityStatus !== undefined) {
    fields.push("disabilityStatus = ?")
    values.push(updates.disabilityStatus || null)
  }
  if (updates.skills !== undefined) {
    fields.push("skills = ?")
    values.push(JSON.stringify(updates.skills))
  }
  if (updates.availability !== undefined) {
    fields.push("availability = ?")
    values.push(updates.availability || null)
  }
  if (updates.accessibilityNeeds !== undefined) {
    fields.push("accessibilityNeeds = ?")
    values.push(JSON.stringify(updates.accessibilityNeeds))
  }
  if (updates.orgName !== undefined) {
    fields.push("orgName = ?")
    values.push(updates.orgName || null)
  }
  if (updates.contactInfo !== undefined) {
    fields.push("contactInfo = ?")
    values.push(updates.contactInfo || null)
  }
  if (updates.description !== undefined) {
    fields.push("description = ?")
    values.push(updates.description || null)
  }
  if (updates.verified !== undefined) {
    fields.push("verified = ?")
    values.push(updates.verified ? 1 : 0)
  }
  if (updates.rejected !== undefined) {
    fields.push("rejected = ?")
    values.push(updates.rejected ? 1 : 0)
  }

  if (fields.length === 0) return user

  fields.push("updatedAt = ?")
  values.push(new Date().toISOString())
  values.push(id)

  await db.execute({
    sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    args: values,
  })
  
  return findUserById(id)
}

export async function comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, user.password)
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await connectDB()
  const user = await findUserById(id)
  if (!user) return false

  await db.execute("BEGIN")

  try {
    await deleteLikesByUser(id)
    await deleteCommentsByVolunteer(id)

    if (user.role === "volunteer") {
      const applications = await findApplications({ volunteerId: id })
      for (const application of applications) {
        await deleteApplication(application.id)
        await updateOpportunityApplicationCount(application.opportunityId)
      }
      await deleteApplicationsByVolunteer(id)
    } else if (user.role === "organization") {
      const opportunities = await findOpportunities({ organizationId: id })
      for (const opportunity of opportunities) {
        await deleteLikesByOpportunity(opportunity.id)
        await deleteCommentsByOpportunity(opportunity.id)
        await deleteApplicationsByOpportunity(opportunity.id)
        await deleteOpportunity(opportunity.id)
      }
    }

    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    })

    await db.execute("COMMIT")
    return true
  } catch (error) {
    await db.execute("ROLLBACK")
    console.error("Error deleting user:", error)
    return false
  }
}

