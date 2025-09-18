import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import type { Session } from 'next-auth';

// GET - Fetch users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const verified = searchParams.get('verified') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Check authorization
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role !== 'admin') {
      // Non-admin users can only see their own profile
      const user = await User.findById(session.user.id)
        .select('-password')
        .lean();
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          users: [user],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalUsers: 1,
            hasNext: false,
            hasPrev: false
          }
        }
      });
    }

    // Build query for admin users
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (verified && verified !== 'all') {
      query.verified = verified === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const userData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      phone: userData.phone || '',
      verified: userData.verified || false,
      profileSetupCompleted: userData.profileSetupCompleted || false
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user (Admin or own profile)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const updateData = await request.json();
    const { userId, ...userData } = updateData;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check authorization
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    const isAdmin = extendedSession?.user?.role === 'admin';
    const isOwnProfile = session.user.id === userId;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this user' },
        { status: 403 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updates: Record<string, unknown> = {};

    // Fields that can be updated by user or admin
    if (userData.name !== undefined) updates.name = userData.name;
    if (userData.phone !== undefined) updates.phone = userData.phone;

    // Fields that can only be updated by admin
    if (isAdmin) {
      if (userData.role !== undefined) updates.role = userData.role;
      if (userData.verified !== undefined) updates.verified = userData.verified;
      if (userData.email !== undefined) {
        // Check if new email already exists
        const existingUser = await User.findOne({ 
          email: userData.email, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Email already exists' },
            { status: 409 }
          );
        }
        updates.email = userData.email;
      }
    }

    // Password update (with current password verification for non-admin)
    if (userData.password) {
      if (!isAdmin && userData.currentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(userData.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 }
          );
        }
      }
      
      if (!isAdmin && !userData.currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      updates.password = await bcrypt.hash(userData.password, 12);
    }

    // Profile setup fields
    if (userData.profileSetupCompleted !== undefined) {
      updates.profileSetupCompleted = userData.profileSetupCompleted;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password').lean();

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 
 
 
 