"use client";

import { useState } from "react";
import { StarRatingInput } from "@/components/product/StarRating";

export function ReviewForm({ productId }: { productId: string }) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, authorName, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Could not submit your review");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-lg border border-brand-success/30 bg-brand-success/5 p-4 font-body text-sm text-brand-success">
        Thanks — your review is in for a quick check before it goes live.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-brand-umber/10 p-4">
      <div>
        <span className="mb-1.5 block font-body text-sm font-medium text-brand-charcoal">Your rating</span>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <label className="block font-body text-sm font-medium text-brand-charcoal">
        <span className="mb-1.5 block">Name</span>
        <input
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="input"
        />
      </label>
      <label className="block font-body text-sm font-medium text-brand-charcoal">
        <span className="mb-1.5 block">Review</span>
        <textarea required rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="input" />
      </label>
      {error && (
        <p role="alert" className="font-body text-sm text-brand-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-umber px-6 py-2 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
