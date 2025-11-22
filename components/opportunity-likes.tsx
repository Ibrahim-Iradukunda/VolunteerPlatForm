"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Heart } from "lucide-react"

interface OpportunityLikesProps {
  opportunityId: string
  initialLikes?: number
  initialIsLiked?: boolean
}

export function OpportunityLikes({ opportunityId, initialLikes = 0, initialIsLiked = false }: OpportunityLikesProps) {
  const { user, isAuthenticated, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    // Fetch current like status
    fetchLikeStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId, user])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        headers: isAuthenticated ? getAuthHeaders() : {},
      })
      if (response.ok) {
        const data = await response.json()
        const opportunity = data.opportunity
        if (opportunity.likesCount !== undefined) {
          setLikesCount(opportunity.likesCount || 0)
        } else if (opportunity.likes) {
          setLikesCount(opportunity.likes.length || 0)
        }
        // Check if current user liked it (if user is authenticated)
        if (isAuthenticated && user) {
          if (opportunity.userLiked !== undefined) {
            setIsLiked(opportunity.userLiked)
          } else if (opportunity.likes) {
            const userLiked = opportunity.likes.some((likeId: any) => {
              const likeIdStr = typeof likeId === 'string' ? likeId : likeId.toString()
              const userIdStr = user.id || (user as any)._id?.toString()
              return likeIdStr === userIdStr
            })
            setIsLiked(userLiked)
          }
        }
      }
    } catch (error) {
      // Error handling silent for better UX
    }
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to like opportunities",
        variant: "destructive",
      })
      return
    }

    try {
      setIsToggling(true)
      const response = await fetch(`/api/opportunities/${opportunityId}/like`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to toggle like",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle like",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleLike}
      disabled={isToggling || !isAuthenticated}
      className="gap-2"
      aria-label={isLiked ? "Unlike this opportunity" : "Like this opportunity"}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likesCount}</span>
    </Button>
  )
}

