import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { uploadProductImage, uploadProfileImage, deleteImageFromS3 } from "@/lib/s3";

// Validate image file
function validateImageFile(file: File) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 10MB');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting request processing...');
    
    // Check S3 environment variables
    const s3EnvCheck = {
      region: !!process.env.AWS_REGION,
      accessKey: !!process.env.AWS_ACCESS_KEY_ID,
      secretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      bucket: !!process.env.AWS_S3_BUCKET_NAME
    };
    console.log('Upload API: S3 Environment check:', s3EnvCheck);
    
    const session = await getServerSession(authOptions);
    console.log('Upload API: Session data:', session ? 'Session exists' : 'No session');
    
    if (!session?.user?.email) {
      console.log('Upload API: No session or email found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Upload API: Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'product' | 'avatar' | 'cover'
    const userId = formData.get('userId') as string;

    console.log('Upload API: Form data parsed - file:', file ? 'File exists' : 'No file', 'type:', type);

    if (!file) {
      console.log('Upload API: No file provided');
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !['product', 'avatar', 'cover'].includes(type)) {
      console.log('Upload API: Invalid upload type:', type);
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    // Validate file
    try {
      console.log('Upload API: Validating file...');
      validateImageFile(file);
      console.log('Upload API: File validation passed');
    } catch (error) {
      console.log('Upload API: File validation failed:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : "Invalid file" 
      }, { status: 400 });
    }

    // Convert file to buffer
    console.log('Upload API: Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Upload API: Buffer created, size:', buffer.length);

    let imageUrl: string;

    try {
      console.log('Upload API: Starting S3 upload, type:', type);
      
      if (type === 'product') {
        // Upload product image
        console.log('Upload API: Uploading product image...');
        imageUrl = await uploadProductImage(buffer, file.name);
        console.log('Upload API: Product image uploaded successfully:', imageUrl);
      } else {
        // Upload profile image (avatar or cover)
        if (!userId) {
          console.log('Upload API: User ID required for profile images');
          return NextResponse.json({ error: "User ID required for profile images" }, { status: 400 });
        }
        const profileType = type as 'avatar' | 'cover';
        console.log('Upload API: Uploading profile image, type:', profileType);
        imageUrl = await uploadProfileImage(buffer, file.name, profileType);
        console.log('Upload API: Profile image uploaded successfully:', imageUrl);
      }

      console.log('Upload API: Returning success response');
      return NextResponse.json({
        success: true,
        data: {
          url: imageUrl,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (uploadError) {
      console.error('Upload API: S3 Upload error:', uploadError);
      
      // Return specific error message from S3 utility
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload image to S3";
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ 
      error: errorMessage,
      details: "Check server logs for more information"
    }, { status: 500 });
  }
}

// Delete image endpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    // Validate that it's an S3 URL from our bucket
    if (!imageUrl.includes('.s3.') || !imageUrl.includes('amazonaws.com')) {
      return NextResponse.json({ error: "Invalid S3 image URL" }, { status: 400 });
    }

    try {
      await deleteImageFromS3(imageUrl);

      return NextResponse.json({
        success: true,
        message: "Image deleted successfully"
      });

    } catch (deleteError) {
      console.error('S3 Delete error:', deleteError);
      
      const errorMessage = deleteError instanceof Error ? deleteError.message : "Failed to delete image from S3";
      
      return NextResponse.json({ 
        error: errorMessage 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}