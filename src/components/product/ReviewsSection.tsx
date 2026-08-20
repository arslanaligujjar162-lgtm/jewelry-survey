import { getReviewStats, type Review } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { StarRatingDisplay } from "@/components/product/StarRating";
import { ReviewForm } from "@/components/product/ReviewForm";

export function ReviewsSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const stats = getReviewStats(reviews);

  return (
    <section className="mt-16 border-t border-brand-umber/10 pt-10" id="reviews">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">Reviews</h2>
          {stats.count > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRatingDisplay rating={stats.average} />
              <span className="font-body text-sm text-brand-charcoal/70">
                {stats.average} out of 5 ({stats.count} review{stats.count === 1 ? "" : "s"})
              </span>
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-brand-charcoal/60">No reviews yet — be the first.</p>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-brand-umber/10 pb-6">
              <div className="flex items-center justify-between gap-4">
                <StarRatingDisplay rating={review.rating} />
                <span className="font-body text-xs text-brand-charcoal/50">{formatDate(review.created_at)}</span>
              </div>
              <p className="mt-2 font-body text-sm font-medium text-brand-charcoal">{review.author_name}</p>
              <p className="mt-1 font-body text-sm text-brand-charcoal/80">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 max-w-md">
        <h3 className="mb-3 font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
          Write a review
        </h3>
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}
