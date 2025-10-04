"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  totalStars?: number
  size?: number
  className?: string
  readonly?: boolean
  onRate?: (rating: number) => void
}

export default function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  className,
  readonly = false,
  onRate,
}: StarRatingProps) {
  const stars = Array.from({ length: totalStars }, (_, i) => i + 1)

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((starValue) => (
        <Star
          key={starValue}
          size={size}
          className={cn(
            "transition-colors",
            starValue <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300",
            !readonly && "cursor-pointer hover:text-yellow-300"
          )}
          onClick={() => !readonly && onRate?.(starValue)}
        />
      ))}
    </div>
  )
}
