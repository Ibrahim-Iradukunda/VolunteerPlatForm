import connectDB from "./connect"
import { generateId } from "@/lib/utils/id"

export interface ILike {
  id: string
  opportunityId: string
  userId: string
  createdAt: string
}

export async function toggleLike(opportunityId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
  const db = await connectDB()

  const existing = await db.execute({
    sql: `
      SELECT id FROM likes WHERE opportunityId = ? AND userId = ?
    `,
    args: [opportunityId, userId],
  })
  const existingRow = existing.rows[0] as { id: string } | undefined

  if (existingRow) {
    await db.execute({
      sql: "DELETE FROM likes WHERE opportunityId = ? AND userId = ?",
      args: [opportunityId, userId],
    })
  } else {
    const id = generateId()
    const now = new Date().toISOString()
    await db.execute({
      sql: `
        INSERT INTO likes (id, opportunityId, userId, createdAt)
        VALUES (?, ?, ?, ?)
      `,
      args: [id, opportunityId, userId, now],
    })
  }

  const countResult = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM likes WHERE opportunityId = ?
    `,
    args: [opportunityId],
  })
  const countRow = countResult.rows[0] as { count: number }

  return {
    liked: !existingRow,
    likesCount: Number(countRow?.count ?? 0),
  }
}

export async function isLiked(opportunityId: string, userId: string): Promise<boolean> {
  const db = await connectDB()
  const result = await db.execute({
    sql: `
      SELECT id FROM likes WHERE opportunityId = ? AND userId = ?
    `,
    args: [opportunityId, userId],
  })
  return !!result.rows[0]
}

export async function getLikesCount(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count FROM likes WHERE opportunityId = ?
    `,
    args: [opportunityId],
  })
  const row = result.rows[0] as { count: number }
  return Number(row?.count ?? 0)
}

export async function getLikedOpportunities(userId: string): Promise<string[]> {
  const db = await connectDB()
  const result = await db.execute({
    sql: `
      SELECT opportunityId FROM likes WHERE userId = ?
    `,
    args: [userId],
  })
  const rows = result.rows as { opportunityId: string }[]
  return rows.map(row => row.opportunityId)
}

export async function deleteLikesByOpportunity(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM likes WHERE opportunityId = ?",
    args: [opportunityId],
  })
  return result.rowsAffected ?? 0
}

export async function deleteLikesByUser(userId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM likes WHERE userId = ?",
    args: [userId],
  })
  return result.rowsAffected ?? 0
}


