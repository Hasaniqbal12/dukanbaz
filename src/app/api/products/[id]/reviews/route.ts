import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/mongodb';
import Product, { IProduct } from '../../../../../models/Product';

// GET: fetch reviews and summary for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id)
      .select('reviews rating totalReviews')
      .lean<{ reviews?: IProduct['reviews']; rating?: number; totalReviews?: number } | null>();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      rating: product.rating ?? 0,
      totalReviews: product.totalReviews ?? (product.reviews?.length || 0),
      reviews: (product.reviews || []).map(r => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        verified: r.verified,
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST: add a new review for a product
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await req.json();

    const { userId, userName, rating, comment, verified } = body as {
      userId?: string;
      userName?: string;
      rating?: number;
      comment?: string;
      verified?: boolean;
    };

    if (!userName || typeof userName !== 'string') {
      return NextResponse.json({ error: 'userName is required' }, { status: 400 });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string') {
      return NextResponse.json({ error: 'comment is required' }, { status: 400 });
    }

    const productDoc = await Product.findById(params.id);
    if (!productDoc) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newReview = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: userId || 'guest',
      userName,
      rating,
      comment,
      date: new Date(),
      verified: !!verified,
    } satisfies IProduct['reviews'][number];

    // push and save to trigger pre-save hooks for rating aggregation
    productDoc.reviews = [...(productDoc.reviews || []), newReview];
    await productDoc.save();

    return NextResponse.json({ message: 'Review added', review: newReview }, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
