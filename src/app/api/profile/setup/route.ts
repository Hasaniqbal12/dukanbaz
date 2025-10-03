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

    // Debug logging
    console.log('Setup API called with:', { step, role, dataKeys: Object.keys(data || {}) });

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
      case 1: // Company Information (Step 1 for both buyer/supplier)
        updateData = {
          company: data.companyName || data.businessName,
          website: data.website,
          bio: data.description,
          businessInfo: {
            businessName: data.companyName || data.businessName,
            businessType: data.businessType,
            employeeCount: data.companySize,
            establishedYear: data.foundedYear
          }
        };
        break;

      case 2: // Contact & Location Information
        updateData = {
          phone: data.phone || data.contactPerson,
          location: data.city && data.state ? `${data.city}, ${data.state}, ${data.country || 'Pakistan'}` : undefined
        };

        // Only save address if we have the required fields
        if (data.address && data.city && data.state) {
          updateData.address = {
            street: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode || '',
            country: data.country || 'Pakistan'
          };
        }

        // Update business info
        updateData.businessInfo = {
          ...user.businessInfo,
          businessPhone: data.phone,
          businessEmail: data.email
        };

        // Only save business address if we have the required fields
        if (data.address && data.city && data.state) {
          updateData.businessInfo.businessAddress = {
            street: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode || '',
            country: data.country || 'Pakistan'
          };
        }
        break;

      case 3: // Business Details (Optional)
        updateData = {
          businessInfo: {
            ...user.businessInfo
          }
        };

        // Only save business details if provided
        if (data.businessLicense || data.taxId) {
          updateData.businessInfo.taxId = data.businessLicense || data.taxId;
        }
        
        if (data.annualRevenue) {
          updateData.businessInfo.annualRevenue = data.annualRevenue;
        }
        
        if (data.certifications && data.certifications.length > 0) {
          updateData.businessInfo.certifications = data.certifications;
        }
        
        // Store role-specific data in a flexible way (also optional)
        if (role === 'buyer') {
          updateData.buyerProfile = {
            ...user.buyerProfile
          };
          
          if (data.productCategories && data.productCategories.length > 0) {
            updateData.buyerProfile.productCategories = data.productCategories;
          }
          
          if (data.budgetRange) {
            updateData.buyerProfile.budgetRange = data.budgetRange;
          }
          
          if (data.orderFrequency) {
            updateData.buyerProfile.orderFrequency = data.orderFrequency;
          }
          
          if (data.preferredSuppliers && data.preferredSuppliers.length > 0) {
            updateData.buyerProfile.preferredSuppliers = data.preferredSuppliers;
          }
        } else if (role === 'supplier') {
          updateData.supplierProfile = {
            ...user.supplierProfile
          };
          
          if (data.productCategories && data.productCategories.length > 0) {
            updateData.supplierProfile.productCategories = data.productCategories;
          }
          
          if (data.minOrderQuantity) {
            updateData.supplierProfile.minOrderQuantity = data.minOrderQuantity;
          }
          
          if (data.productionCapacity) {
            updateData.supplierProfile.productionCapacity = data.productionCapacity;
          }
          
          if (data.certifications && data.certifications.length > 0) {
            updateData.supplierProfile.certifications = data.certifications;
          }
        }
        break;

      case 4: // Purchasing/Product Information (Optional)
        if (role === 'buyer') {
          updateData.buyerProfile = {
            ...user.buyerProfile
          };
          
          // Only save if data is provided
          if (data.productCategories && data.productCategories.length > 0) {
            updateData.buyerProfile.productCategories = data.productCategories;
          }
          
          if (data.budgetRange) {
            updateData.buyerProfile.budgetRange = data.budgetRange;
          }
          
          if (data.orderFrequency) {
            updateData.buyerProfile.orderFrequency = data.orderFrequency;
          }
          
          if (data.preferredSuppliers && data.preferredSuppliers.length > 0) {
            updateData.buyerProfile.preferredSuppliers = data.preferredSuppliers;
          }
        } else if (role === 'supplier') {
          updateData.supplierProfile = {
            ...user.supplierProfile
          };
          
          // Only save if data is provided
          if (data.productCategories && data.productCategories.length > 0) {
            updateData.supplierProfile.productCategories = data.productCategories;
          }
          
          if (data.minOrderQuantity) {
            updateData.supplierProfile.minOrderQuantity = data.minOrderQuantity;
          }
          
          if (data.productionCapacity) {
            updateData.supplierProfile.productionCapacity = data.productionCapacity;
          }
          
          if (data.shippingMethods && data.shippingMethods.length > 0) {
            updateData.supplierProfile.shippingMethods = data.shippingMethods;
          }
        }
        break;

      case 5: // Payment Terms & Finalization (Optional)
        updateData = {
          profileSetupCompleted: true,
          setupCompletedAt: new Date()
        };
        
        if (role === 'buyer') {
          updateData.buyerProfile = {
            ...user.buyerProfile
          };
          
          // Only save if data is provided
          if (data.paymentTerms) {
            updateData.buyerProfile.paymentTerms = data.paymentTerms;
          }
          
          if (data.creditLimit) {
            updateData.buyerProfile.creditLimit = data.creditLimit;
          }
        } else if (role === 'supplier') {
          updateData.supplierProfile = {
            ...user.supplierProfile
          };
          
          // Only save if data is provided
          if (data.paymentTerms) {
            updateData.supplierProfile.paymentTerms = data.paymentTerms;
          }
          
          if (data.minimumOrder) {
            updateData.supplierProfile.minimumOrder = data.minimumOrder;
          }
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Update the user
    console.log('Updating user with data:', JSON.stringify(updateData, null, 2));
    
    try {
      Object.assign(user, updateData);
      user.updatedAt = new Date();
      
      await user.save();
      console.log('User updated successfully');
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      throw saveError;
    }

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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for specific MongoDB/Mongoose errors
      if (error.name === 'ValidationError') {
        return NextResponse.json({ 
          error: "Validation failed: " + error.message 
        }, { status: 400 });
      }
      
      if (error.name === 'CastError') {
        return NextResponse.json({ 
          error: "Invalid data format: " + error.message 
        }, { status: 400 });
      }
      
      // For development, show the actual error message
      return NextResponse.json({ 
        error: `Setup error: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}