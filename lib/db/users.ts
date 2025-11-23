import { getDB } from "./connect"
import bcrypt from "bcryptjs"
import { generateId } from "@/lib/utils/id"

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
}

export async function createUser(userData: IUserInput): Promise<IUser> {
  const db = getDB()
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
    createdAt: now,
    updatedAt: now,
  }

  db.prepare(`
    INSERT INTO users (
      id, email, password, name, role, disabilityStatus, skills, availability,
      accessibilityNeeds, orgName, contactInfo, description, verified, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    user.createdAt,
    user.updatedAt
  )

  return user
}

export function findUserByEmail(email: string): IUser | null {
  const db = getDB()
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as any
  
  if (!row) return null
  
  return {
    ...row,
    skills: JSON.parse(row.skills || "[]"),
    accessibilityNeeds: JSON.parse(row.accessibilityNeeds || "[]"),
    verified: row.verified === 1,
  }
}

export function findUserById(id: string): IUser | null {
  const db = getDB()
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any
  
  if (!row) return null
  
  return {
    ...row,
    skills: JSON.parse(row.skills || "[]"),
    accessibilityNeeds: JSON.parse(row.accessibilityNeeds || "[]"),
    verified: row.verified === 1,
  }
}

export function findUsers(query: {
  role?: string
  search?: string
}): IUser[] {
  const db = getDB()
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

  const rows = db.prepare(sql).all(...params) as any[]
  
  return rows.map(row => ({
    ...row,
    skills: JSON.parse(row.skills || "[]"),
    accessibilityNeeds: JSON.parse(row.accessibilityNeeds || "[]"),
    verified: row.verified === 1,
  }))
}

export function updateUser(id: string, updates: Partial<IUserInput>): IUser | null {
  const db = getDB()
  const user = findUserById(id)
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

  if (fields.length === 0) return user

  fields.push("updatedAt = ?")
  values.push(new Date().toISOString())
  values.push(id)

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values)
  
  return findUserById(id)
}

export async function comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, user.password)
}

