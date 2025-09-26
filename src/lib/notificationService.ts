interface NotificationData {
  userId: string;
  type: 'order' | 'message' | 'payment' | 'shipping' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export async function sendNotification(notificationData: NotificationData): Promise<boolean> {
  try {
    // For now, we'll just log the notification
    // In a production environment, this would integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - Push notification service (Firebase, OneSignal, etc.)
    // - SMS service (Twilio, etc.)
    // - In-app notification system
    
    console.log('📧 Notification sent:', {
      to: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      actionUrl: notificationData.actionUrl,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual notification sending logic
    // Example implementations:
    
    // 1. Email notification
    // await sendEmail({
    //   to: userEmail,
    //   subject: notificationData.title,
    //   html: generateEmailTemplate(notificationData)
    // });

    // 2. Push notification
    // await sendPushNotification({
    //   userId: notificationData.userId,
    //   title: notificationData.title,
    //   body: notificationData.message,
    //   data: notificationData.data
    // });

    // 3. In-app notification (save to database)
    // await saveInAppNotification({
    //   userId: notificationData.userId,
    //   type: notificationData.type,
    //   title: notificationData.title,
    //   message: notificationData.message,
    //   isRead: false,
    //   createdAt: new Date()
    // });

    return true;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return false;
  }
}

export async function sendEmailNotification(
  email: string, 
  subject: string, 
  htmlContent: string
): Promise<boolean> {
  try {
    // TODO: Implement email sending logic
    // Example with SendGrid, Nodemailer, or AWS SES
    
    console.log('📧 Email notification sent:', {
      to: email,
      subject,
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
    return false;
  }
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    // TODO: Implement push notification logic
    // Example with Firebase Cloud Messaging or OneSignal
    
    console.log('🔔 Push notification sent:', {
      to: userId,
      title,
      body,
      data,
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    return false;
  }
}

// Interface for order data
interface OrderNotificationData {
  orderNumber: string;
  buyerName: string;
  totalAmount: number;
  products: Array<{
    productName: string;
    quantity: number;
  }>;
}

// Helper function to generate email templates
export function generateOrderNotificationEmail(orderData: OrderNotificationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Received - ${orderData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Order Received!</h1>
          <p>Order #${orderData.orderNumber}</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You have received a new order from <strong>${orderData.buyerName}</strong>.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Total Amount:</strong> Rs ${orderData.totalAmount.toLocaleString()}</p>
            <p><strong>Products:</strong></p>
            <ul>
              ${orderData.products.map(product => 
                `<li>${product.productName} (Qty: ${product.quantity})</li>`
              ).join('')}
            </ul>
          </div>
          
          <p>Please log in to your supplier dashboard to view the complete order details and process the order.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/orders" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from WholesaleHub.</p>
          <p>&copy; ${new Date().getFullYear()} WholesaleHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
