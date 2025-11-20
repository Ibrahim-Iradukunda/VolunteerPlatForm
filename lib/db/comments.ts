import connectDB from "./connect"
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

export async function createComment(commentData: ICommentInput): Promise<IComment> {
  const db = await connectDB()
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

  await db.execute({
    sql: `
      INSERT INTO comments (id, opportunityId, volunteerId, volunteerName, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      comment.id,
      comment.opportunityId,
      comment.volunteerId,
      comment.volunteerName,
      comment.content,
      comment.createdAt,
    ],
  })

  return comment
}

export async function findCommentsByOpportunityId(opportunityId: string): Promise<IComment[]> {
  const db = await connectDB()
  const result = await db.execute({
    sql: `
      SELECT c.*, u.email as volunteerEmail
      FROM comments c
      LEFT JOIN users u ON c.volunteerId = u.id
      WHERE c.opportunityId = ?
      ORDER BY c.createdAt DESC
    `,
    args: [opportunityId],
  })
  const rows = result.rows as any[]
  
  return rows.map(row => ({
    id: row.id,
    opportunityId: row.opportunityId,
    volunteerId: row.volunteerId,
    volunteerName: row.volunteerName,
    content: row.content,
    createdAt: row.createdAt,
  }))
}

export async function deleteCommentsByOpportunity(opportunityId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM comments WHERE opportunityId = ?",
    args: [opportunityId],
  })
  return result.rowsAffected ?? 0
}

export async function deleteCommentsByVolunteer(volunteerId: string): Promise<number> {
  const db = await connectDB()
  const result = await db.execute({
    sql: "DELETE FROM comments WHERE volunteerId = ?",
    args: [volunteerId],
  })
  return result.rowsAffected ?? 0
}


