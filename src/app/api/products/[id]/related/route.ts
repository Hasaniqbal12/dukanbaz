import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';

type LeanProductHead = { category?: string; subcategory?: string; tags?: string[] };
type LeanRelatedItem = {
  _id: unknown;
  title?: string;
  images?: string[];
  price?: number;
  originalPrice?: number;
  category?: string;
  subcategory?: string;
  rating?: number;
  totalReviews?: number;
  available?: number;
  unit?: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const current = await Product.findById(params.id)
      .select('category subcategory tags')
      .lean<LeanProductHead | null>();
    if (!current) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const filters: Record<string, unknown> = {
      _id: { $ne: params.id },
      status: 'active',
    };

    if (current.category) filters.category = current.category;
    if (current.subcategory) filters.subcategory = current.subcategory;

    // Prefer same category/subcategory, then fallback by tags if needed
    let related = await Product.find(filters)
      .select('title images price originalPrice category subcategory rating totalReviews available unit')
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .limit(8)
      .lean<LeanRelatedItem[]>();

    if (!related || related.length === 0 && current.tags && current.tags.length) {
      related = await Product.find({
        _id: { $ne: params.id },
        tags: { $in: current.tags },
        status: 'active',
      })
        .select('title images price originalPrice category subcategory rating totalReviews available unit')
        .sort({ rating: -1, createdAt: -1 })
        .limit(8)
        .lean<LeanRelatedItem[]>();
    }

    const normalized = (related || []).map((p: LeanRelatedItem) => ({
      _id: String(p._id),
      title: p.title,
      image: p.images?.[0],
      price: p.price,
      comparePrice: p.originalPrice ?? undefined,
      category: p.category,
      subcategory: p.subcategory || undefined,
      rating: p.rating ?? 0,
      reviewCount: p.totalReviews ?? 0,
      stock: typeof p.available === 'number' ? p.available : 0,
      unit: p.unit,
    }));

    return NextResponse.json({ items: normalized });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}
