import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Validate environment variables
function validateS3Config() {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required AWS S3 environment variables: ${missingVars.join(', ')}`);
  }

  return {
    region: process.env.AWS_REGION!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  };
}

// Generate unique filename
function generateUniqueFileName(originalName: string, type: 'product' | 'avatar' | 'cover'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  return `${type}/${timestamp}-${randomString}.${extension}`;
}

// Upload product image to S3
export async function uploadProductImage(file: Buffer, originalName: string): Promise<string> {
  try {
    const config = validateS3Config();
    const fileName = generateUniqueFileName(originalName, 'product');
    
    const uploadParams = {
      Bucket: config.bucketName,
      Key: fileName,
      Body: file,
      ContentType: getContentType(originalName),
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        'uploaded-by': 'wholesalehub',
        'image-type': 'product',
        'uploaded-at': new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return public URL
    const imageUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${fileName}`;
    return imageUrl;

  } catch (error) {
    console.error('Error uploading product image to S3:', error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing required AWS')) {
        throw new Error('AWS S3 configuration is incomplete. Please check your environment variables.');
      } else if (error.message.includes('The AWS Access Key Id you provided does not exist')) {
        throw new Error('Invalid AWS Access Key ID. Please check your AWS credentials.');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        throw new Error('Invalid AWS Secret Access Key. Please check your AWS credentials.');
      } else if (error.message.includes('NoSuchBucket')) {
        throw new Error('S3 bucket does not exist. Please check your bucket name and region.');
      }
    }
    
    throw new Error('Failed to upload product image to S3');
  }
}

// Upload profile image (avatar/cover) to S3
export async function uploadProfileImage(file: Buffer, originalName: string, type: 'avatar' | 'cover'): Promise<string> {
  try {
    const config = validateS3Config();
    const fileName = generateUniqueFileName(originalName, type);
    
    const uploadParams = {
      Bucket: config.bucketName,
      Key: fileName,
      Body: file,
      ContentType: getContentType(originalName),
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        'uploaded-by': 'wholesalehub',
        'image-type': type,
        'uploaded-at': new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return public URL
    const imageUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${fileName}`;
    return imageUrl;

  } catch (error) {
    console.error(`Error uploading ${type} image to S3:`, error);
    throw new Error(`Failed to upload ${type} image to S3`);
  }
}

// Delete image from S3
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    const config = validateS3Config();
    
    // Extract key from URL
    const urlParts = imageUrl.split('/');
    const bucketPart = urlParts.find(part => part.includes(config.bucketName));
    
    if (!bucketPart) {
      throw new Error('Invalid S3 URL format');
    }
    
    const bucketIndex = urlParts.indexOf(bucketPart);
    const key = urlParts.slice(bucketIndex + 1).join('/');
    
    const deleteParams = {
      Bucket: config.bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new Error('Failed to delete image from S3');
  }
}

// Generate presigned URL for secure uploads (optional)
export async function generatePresignedUploadUrl(fileName: string, contentType: string): Promise<string> {
  try {
    const config = validateS3Config();
    
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

// Helper function to determine content type
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

// Check if S3 is properly configured
export async function testS3Connection(): Promise<boolean> {
  try {
    validateS3Config();
    
    // Try to list objects in bucket (this will fail gracefully if no permissions)
    const config = validateS3Config();
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: 'test-connection.txt',
      Body: 'Connection test',
      ContentType: 'text/plain',
    });
    
    await s3Client.send(command);
    
    // Clean up test file
    await deleteImageFromS3(`https://${config.bucketName}.s3.${config.region}.amazonaws.com/test-connection.txt`);
    
    return true;
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return false;
  }
}

export { s3Client };