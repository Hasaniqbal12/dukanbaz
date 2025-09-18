# DukanBaz AWS Amplify Deployment Guide

This guide will help you deploy your DukanBaz B2B marketplace to AWS Amplify.

## Prerequisites

1. **AWS Account** - Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **GitHub Repository** - Push your code to GitHub
3. **MongoDB Atlas** - Set up a cloud database at [mongodb.com/atlas](https://mongodb.com/atlas)

## Step 1: Prepare Your Environment Variables

Before deploying, you'll need to set up the following environment variables in AWS Amplify:

### Required Environment Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dukanbaz
NEXTAUTH_SECRET=generate-a-32-character-random-string
NEXTAUTH_URL=https://your-app-name.amplifyapp.com
```

### Optional Environment Variables (if using these services):
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@dukanbaz.com
```

## Step 2: Deploy to AWS Amplify

### Option A: Deploy via AWS Console (Recommended)

1. **Go to AWS Amplify Console**
   - Visit [console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Host web app"

2. **Connect Your Repository**
   - Select "GitHub" as your Git provider
   - Authorize AWS Amplify to access your GitHub account
   - Select your DukanBaz repository
   - Choose the main/master branch

3. **Configure Build Settings**
   - Amplify will auto-detect your Next.js app
   - The `amplify.yml` file will be used automatically
   - Review the build settings and click "Next"

4. **Add Environment Variables**
   - In the "Environment variables" section, add all the variables listed above
   - Make sure to replace placeholder values with your actual credentials

5. **Deploy**
   - Click "Save and deploy"
   - Wait for the build to complete (usually 5-10 minutes)

### Option B: Deploy via Amplify CLI

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   # Select "Amazon CloudFront and S3"
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

## Step 3: Configure Custom Domain (Optional)

1. **Purchase Domain** - Buy `dukanbaz.com` from a domain registrar
2. **Add Custom Domain in Amplify**
   - Go to your app in Amplify Console
   - Click "Domain management" → "Add domain"
   - Enter `dukanbaz.com` and follow the DNS configuration steps

## Step 4: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster (free tier available)

2. **Configure Database Access**
   - Create a database user with read/write permissions
   - Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string and update your `MONGODB_URI` environment variable

## Step 5: Test Your Deployment

1. **Visit Your Site** - Go to your Amplify app URL
2. **Test Key Features**:
   - User registration/login
   - Product browsing
   - Cart functionality
   - Checkout process

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check the build logs in Amplify Console
   - Ensure all dependencies are in `package.json`
   - Verify environment variables are set correctly

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your deployed URL
   - Generate a strong `NEXTAUTH_SECRET`
   - Check callback URLs in OAuth providers

### Performance Optimization:

1. **Enable Caching**
   - Amplify automatically enables CloudFront CDN
   - Configure cache headers in `next.config.ts`

2. **Image Optimization**
   - Use Next.js `Image` component instead of `<img>` tags
   - Configure image domains in `next.config.ts`

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] User authentication works
- [ ] Database operations function
- [ ] Email notifications work (if configured)
- [ ] Payment integration works (if configured)
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags are correct
- [ ] Custom domain configured (if applicable)

## Support

For deployment issues:
- AWS Amplify Documentation: [docs.amplify.aws](https://docs.amplify.aws)
- MongoDB Atlas Documentation: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Next.js Deployment Guide: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**DukanBaz** - Pakistan's Premier B2B Wholesale Marketplace
