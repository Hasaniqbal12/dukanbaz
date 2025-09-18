import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Offer from '@/models/Offer';
import Notification from '@/models/Notification';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const offer = await Offer.findById(params.id);
  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(offer);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { status } = await req.json();
  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const offer = await Offer.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  // Create notification for supplier
  await Notification.create({
    userId: offer.supplierId,
    type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
    offerId: offer._id,
    requestId: offer.requestId,
    message: `Your offer has been ${status}.`
  });
  
  return NextResponse.json(offer);
} 