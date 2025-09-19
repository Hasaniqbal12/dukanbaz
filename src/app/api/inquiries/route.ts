import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Inquiry from '../../../models/Inquiry';
import Product from '../../../models/Product';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const required = ['productId', 'supplierId', 'buyerName', 'message'];
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json({ error: `${f} is required` }, { status: 400 });
      }
    }

    // Ensure product exists and copy title for convenience
    const product = await Product.findById(body.productId)
      .select('title supplier')
      .lean<{ title?: string; supplier?: unknown } | null>();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const inquiry = await Inquiry.create({
      productId: String(body.productId),
      productTitle: product.title ?? undefined,
      supplierId: String(body.supplierId),
      buyerId: body.buyerId ? String(body.buyerId) : undefined,
      buyerName: String(body.buyerName),
      buyerEmail: body.buyerEmail ? String(body.buyerEmail) : undefined,
      companyName: body.companyName ? String(body.companyName) : undefined,
      country: body.country ? String(body.country) : undefined,
      quantity: typeof body.quantity === 'number' ? body.quantity : undefined,
      unit: body.unit ? String(body.unit) : undefined,
      targetPrice: typeof body.targetPrice === 'number' ? body.targetPrice : undefined,
      message: String(body.message),
      attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
      contactMethod: body.contactMethod || 'chat',
      status: 'new',
    });

    return NextResponse.json({ message: 'Inquiry submitted', inquiryId: inquiry._id }, { status: 201 });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
