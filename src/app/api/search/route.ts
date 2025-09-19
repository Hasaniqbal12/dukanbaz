import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        products: [], 
        message: 'Query must be at least 2 characters long' 
      });
    }

    await dbConnect();
    
    // Create search index for text search
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Search products by name, description, category, and tags
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const products = await db.collection('products').find({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { subcategory: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { 'supplier.name': { $regex: searchRegex } }
      ]
    })
    .limit(20)
    .toArray();

    // Also search suppliers
    const suppliers = await db.collection('users').find({
      $and: [
        { role: 'supplier' },
        {
          $or: [
            { name: { $regex: searchRegex } },
            { 'profile.companyName': { $regex: searchRegex } },
            { 'profile.businessType': { $regex: searchRegex } }
          ]
        }
      ]
    })
    .limit(10)
    .toArray();

    return NextResponse.json({
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        images: product.images || [],
        supplier: product.supplier
      })),
      suppliers: suppliers.map(supplier => ({
        _id: supplier._id,
        name: supplier.name,
        companyName: supplier.profile?.companyName,
        businessType: supplier.profile?.businessType
      })),
      totalResults: products.length + suppliers.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
