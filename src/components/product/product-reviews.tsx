"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./star-rating";

const reviewFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  comment: z.string().min(10, "Comment must be at least 10 characters."),
  rating: z.number().min(1, "Please provide a rating.").max(5),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ProductReviews({ product }: { product: Product }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [isLoading, setIsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    // Determine if the current user can review the product
    if (status === 'authenticated' && session?.user.id) {
        // Check if user has purchased the product (logic handled by API)
        // For client-side check, we assume false until verified or submitted
        // and also check if user has already reviewed
        const hasReviewed = reviews.some(r => r.userId === session.user.id);
        setCanReview(!hasReviewed); // Simplified check, server is the source of truth
    } else {
        setCanReview(false);
    }
  }, [status, session, reviews]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { title: "", comment: "", rating: 0 },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit review.");
      }

      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      form.reset();
      toast.success("Review submitted!", {
        description: "Thank you for your feedback.",
      });
    } catch (error: any) {
      toast.error("Submission Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {status === 'authenticated' && canReview && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating</FormLabel>
                      <FormControl>
                        <StarRating rating={field.value} onRate={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Best purchase ever!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share your thoughts on the product..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Review
                </Button>
              </form>
            </Form>
          </div>
        )}
        
        <Separator />

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.user.image || ''} alt={review.user.name || ''} />
                  <AvatarFallback>{review.user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.createdAt), "PPP")}
                    </p>
                  </div>
                  {review.rating && <StarRating rating={review.rating.value} readonly size={16} className="mt-1" />}
                  <h4 className="font-medium mt-2">{review.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            This product has no reviews yet. Be the first to share your thoughts!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
