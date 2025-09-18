import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test auth attempt:', { email });
    
    await dbConnect();
    console.log('Database connected');
    
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValidPassword);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const userCount = await User.countDocuments();
    const users = await User.find({}, 'name email role').limit(5);
    
    return NextResponse.json({
      success: true,
      userCount,
      sampleUsers: users
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ success: false, error: 'Database connection failed' });
  }
}
