import { getDB } from "./connect"
import { generateId } from "@/lib/utils/id"

export interface ILike {
  id: string
  opportunityId: string
  userId: string
  createdAt: string
}

export function toggleLike(opportunityId: string, userId: string): { liked: boolean; likesCount: number } {
  const db = getDB()
  
  // Check if like exists
  const existing = db.prepare(`
    SELECT id FROM likes WHERE opportunityId = ? AND userId = ?
  `).get(opportunityId, userId) as { id: string } | undefined

  if (existing) {
    // Unlike
    db.prepare("DELETE FROM likes WHERE opportunityId = ? AND userId = ?").run(opportunityId, userId)
  } else {
    // Like
    const id = generateId()
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO likes (id, opportunityId, userId, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(id, opportunityId, userId, now)
  }

  // Get updated count
  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM likes WHERE opportunityId = ?
  `).get(opportunityId) as { count: number }

  return {
    liked: !existing,
    likesCount: countResult.count,
  }
}

export function isLiked(opportunityId: string, userId: string): boolean {
  const db = getDB()
  const result = db.prepare(`
    SELECT id FROM likes WHERE opportunityId = ? AND userId = ?
  `).get(opportunityId, userId)
  
  return !!result
}

export function getLikesCount(opportunityId: string): number {
  const db = getDB()
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM likes WHERE opportunityId = ?
  `).get(opportunityId) as { count: number }
  
  return result.count
}

export function getLikedOpportunities(userId: string): string[] {
  const db = getDB()
  const rows = db.prepare(`
    SELECT opportunityId FROM likes WHERE userId = ?
  `).all(userId) as { opportunityId: string }[]
  
  return rows.map(row => row.opportunityId)
}

export function deleteLikesByOpportunity(opportunityId: string): number {
  const db = getDB()
  const result = db.prepare("DELETE FROM likes WHERE opportunityId = ?").run(opportunityId)
  return result.changes
}

export function deleteLikesByUser(userId: string): number {
  const db = getDB()
  const result = db.prepare("DELETE FROM likes WHERE userId = ?").run(userId)
  return result.changes
}

