"use client";

import { FiStar } from "react-icons/fi";

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface ReviewsData {
  rating: number;
  totalReviews: number;
  reviews: ReviewItem[];
}

interface Props {
  data: ReviewsData | null;
}

export default function ReviewsBlock({ data }: Props) {
  if (!data || data.totalReviews === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No reviews yet for this product.</p>
        <p className="text-sm">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-3xl font-bold text-gray-900">{data.rating.toFixed(1)}</div>
        <div className="text-sm text-gray-600">Based on {data.totalReviews} reviews</div>
      </div>
      <div className="space-y-4">
        {data.reviews.map((r) => (
          <div key={r.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{r.userName}</div>
              <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 my-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-gray-700 text-sm">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
