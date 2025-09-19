import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Category from '../../../models/Category';

export async function GET() {
  await dbConnect();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const category = await Category.create(data);
  return NextResponse.json(category, { status: 201 });
} 
 
 
 