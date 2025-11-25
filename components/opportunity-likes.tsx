"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Heart } from "lucide-react"
import { getOpportunityLikeStats, toggleOpportunityLike } from "@/lib/mock-data"

interface OpportunityLikesProps {
  opportunityId: string
}

export function OpportunityLikes({ opportunityId }: OpportunityLikesProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    refreshLikeState()

    if (typeof window === "undefined") {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "opportunityLikes") {
        refreshLikeState()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId, user?.id, (user as any)?._id])

  const refreshLikeState = () => {
    const stats = getOpportunityLikeStats(opportunityId, (user as any)?._id || user?.id)
    setLikesCount(stats.likesCount)
    setIsLiked(stats.isLiked)
  }

  const handleToggleLike = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login required",
        description: "Please log in to like opportunities",
        variant: "destructive",
      })
      return
    }

    const userId = (user as any)._id || user.id
    const result = toggleOpportunityLike(opportunityId, userId)
    setIsLiked(result.liked)
    setLikesCount(result.likesCount)
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleLike}
      disabled={!isAuthenticated}
      className="gap-2"
      aria-label={isLiked ? "Unlike this opportunity" : "Like this opportunity"}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likesCount}</span>
    </Button>
  )
}
