import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "../../../../lib/mongodb";
import User from "../../../../models/User";

// POST /api/profile/setup - Complete profile setup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { step, data, role } = body;

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role if provided
    if (role && role !== user.role) {
      user.role = role;
    }

    // Handle different setup steps
    let updateData: any = {};

    switch (step) {
      case 1: // Contact & Location
        updateData = {
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country || 'Pakistan'
        };
        break;

      case 2: // Business Information
        updateData = {
          businessName: data.businessName,
          businessType: data.businessType,
          taxId: data.taxId,
          website: data.website,
          description: data.description,
          companySize: data.companySize,
          foundedYear: data.foundedYear,
          languages: data.languages
        };
        break;

      case 3: // Product/Purchase Information
        if (role === 'supplier') {
          updateData = {
            productCategories: data.productCategories,
            certifications: data.certifications,
            minOrderQuantity: data.minOrderQuantity,
            productionCapacity: data.productionCapacity
          };
        } else if (role === 'buyer') {
          updateData = {
            productCategories: data.productCategories,
            purchaseVolume: data.purchaseVolume,
            preferredPaymentMethods: data.preferredPaymentMethods,
            annualRevenue: data.annualRevenue
          };
        }
        break;

      case 4: // Additional Information
        updateData = {
          socialLinks: data.socialLinks,
          profileImage: data.profileImage,
          coverImage: data.coverImage,
          bankDetails: data.bankDetails,
          businessLicense: data.businessLicense
        };
        break;

      case 5: // Finalization
        updateData = {
          isProfileComplete: true,
          setupCompletedAt: new Date()
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Update the user
    Object.assign(user, updateData);
    user.updatedAt = new Date();
    
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: `Step ${step} completed successfully`
    });

  } catch (error) {
    console.error("Profile setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}