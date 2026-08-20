import { listReviews } from "@/lib/admin/queries";
import { updateReviewStatusAction } from "@/lib/admin/actions";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { StarRatingDisplay } from "@/components/product/StarRating";
import { formatDate } from "@/lib/format";

const STATUSES = ["pending", "approved", "rejected"] as const;

export default async function AdminReviewsPage() {
  const reviews = await listReviews();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Reviews</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-brand-sky-light/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Product</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Rating</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Review</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Submitted</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="px-4 py-3 text-brand-charcoal/80">{review.product_name}</td>
                <td className="px-4 py-3">
                  <StarRatingDisplay rating={review.rating} />
                </td>
                <td className="max-w-xs px-4 py-3 text-brand-charcoal/80">
                  <p className="font-medium text-brand-charcoal">{review.author_name}</p>
                  <p>{review.comment}</p>
                </td>
                <td className="px-4 py-3 text-brand-charcoal/70">{formatDate(review.created_at)}</td>
                <td className="px-4 py-3">
                  <StatusUpdateForm
                    action={updateReviewStatusAction.bind(null, review.id)}
                    currentStatus={review.status}
                    options={STATUSES}
                  />
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-charcoal/50">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
