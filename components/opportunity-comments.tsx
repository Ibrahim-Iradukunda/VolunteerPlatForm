"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send } from "lucide-react"

interface Comment {
  _id: string
  volunteerId: {
    name: string
    email: string
  }
  volunteerName: string
  content: string
  createdAt: string
}

interface OpportunityCommentsProps {
  opportunityId: string
}

export function OpportunityComments({ opportunityId }: OpportunityCommentsProps) {
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [opportunityId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/comments?opportunityId=${opportunityId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      // Error handling silent for better UX
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          opportunityId,
          content: newComment.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment("")
        toast({
          title: "Comment posted",
          description: "Your comment has been added successfully.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to post comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <CardTitle>Comments ({comments.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated && (
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{newComment.length}/500</p>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Please log in to comment on this opportunity.
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(comment.volunteerName || comment.volunteerId?.name || "U")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {comment.volunteerName || comment.volunteerId?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

