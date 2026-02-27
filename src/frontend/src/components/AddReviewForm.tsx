import { useState } from "react";
import { useAddReview } from "../hooks/useQueries";
import { StarRatingInput } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddReviewFormProps {
  locationId: bigint;
}

export function AddReviewForm({ locationId }: AddReviewFormProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const addReview = useAddReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      await addReview.mutateAsync({
        locationId,
        reviewerName: reviewerName.trim(),
        comment: comment.trim(),
        rating: BigInt(rating),
      });
      toast.success("Review submitted! Thank you.");
      setReviewerName("");
      setComment("");
      setRating(0);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reviewer-name" className="text-sm font-medium">
          Your Name
        </Label>
        <Input
          id="reviewer-name"
          placeholder="Enter your name"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Rating</Label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment" className="text-sm font-medium">
          Comment
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="bg-background resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={addReview.isPending}
      >
        {addReview.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
}
