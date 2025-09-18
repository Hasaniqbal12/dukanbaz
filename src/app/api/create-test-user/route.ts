import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@dukanbaz.com' });
    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test user already exists',
        credentials: {
          email: 'test@dukanbaz.com',
          password: 'test123'
        }
      });
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@dukanbaz.com',
      password: hashedPassword,
      role: 'buyer',
      verified: true,
      isActive: true,
      company: 'Test Company',
      location: 'Karachi, Pakistan'
    });
    
    await testUser.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test user created successfully',
      credentials: {
        email: 'test@dukanbaz.com',
        password: 'test123'
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test user' 
    }, { status: 500 });
  }
}
