"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Send } from "lucide-react"
import { addOpportunityComment, getOpportunityComments } from "@/lib/mock-data"

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

interface OpportunityCommentsProps {
  opportunityId: string
}

export function OpportunityComments({ opportunityId }: OpportunityCommentsProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchComments()

    if (typeof window === "undefined") {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "opportunityComments") {
        fetchComments()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [opportunityId])

  const fetchComments = () => {
    try {
      setIsLoading(true)
      const data = getOpportunityComments(opportunityId)
      setComments(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = () => {
    if (!newComment.trim() || !isAuthenticated || !user) return

    const userId = (user as any)._id || user.id
    const comment = addOpportunityComment({
      opportunityId,
      userId,
      userName: user.name,
      content: newComment.trim(),
    })

    setComments((prev) => [comment, ...prev])
    setNewComment("")
    toast({
      title: "Comment posted",
      description: "Your comment has been added successfully.",
    })
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
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()} size="sm">
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
              <div key={comment.id} className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(comment.userName || "U")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {comment.userName || "Anonymous"}
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

