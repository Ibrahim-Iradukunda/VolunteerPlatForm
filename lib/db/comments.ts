import { getDB } from "./connect"
import { generateId } from "@/lib/utils/id"

export interface IComment {
  id: string
  opportunityId: string
  volunteerId: string
  volunteerName: string
  content: string
  createdAt: string
}

export interface ICommentInput {
  opportunityId: string
  volunteerId: string
  volunteerName: string
  content: string
}

export function createComment(commentData: ICommentInput): IComment {
  const db = getDB()
  const id = generateId()
  const now = new Date().toISOString()
  
  const comment: IComment = {
    id,
    opportunityId: commentData.opportunityId,
    volunteerId: commentData.volunteerId,
    volunteerName: commentData.volunteerName,
    content: commentData.content,
    createdAt: now,
  }

  db.prepare(`
    INSERT INTO comments (id, opportunityId, volunteerId, volunteerName, content, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    comment.id,
    comment.opportunityId,
    comment.volunteerId,
    comment.volunteerName,
    comment.content,
    comment.createdAt
  )

  return comment
}

export function findCommentsByOpportunityId(opportunityId: string): IComment[] {
  const db = getDB()
  const rows = db.prepare(`
    SELECT c.*, u.email as volunteerEmail
    FROM comments c
    LEFT JOIN users u ON c.volunteerId = u.id
    WHERE c.opportunityId = ?
    ORDER BY c.createdAt DESC
  `).all(opportunityId) as any[]
  
  return rows.map(row => ({
    id: row.id,
    opportunityId: row.opportunityId,
    volunteerId: row.volunteerId,
    volunteerName: row.volunteerName,
    content: row.content,
    createdAt: row.createdAt,
  }))
}

