import { dbConnect } from '@/lib/mongodb';
import Notification from '@/models/Notification';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'product' | 'offer' | 'request' | 'system' | 'payment' | 'review';
  data?: Record<string, any>;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class NotificationService {
  
  // Create a new notification
  static async createNotification(params: CreateNotificationParams) {
    try {
      await dbConnect();
      
      const notification = new Notification({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        data: params.data || {},
        actionUrl: params.actionUrl,
        priority: params.priority || 'medium',
        isRead: false
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Order-related notifications
  static async notifyOrderStatusUpdate(userId: string, orderNumber: string, status: string, orderId: string) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed by the supplier',
      processing: 'Your order is being prepared for shipment',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'Your order has been cancelled'
    };

    return this.createNotification({
      userId,
      title: `Order ${orderNumber} ${status}`,
      message: statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`,
      type: 'order',
      actionUrl: `/orders`,
      data: { orderId, orderNumber, status },
      priority: status === 'cancelled' ? 'high' : 'medium'
    });
  }

  static async notifyNewOrder(supplierId: string, orderNumber: string, buyerName: string, orderId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'New Order Received',
      message: `You have received a new order ${orderNumber} from ${buyerName}`,
      type: 'order',
      actionUrl: `/seller/orders`,
      data: { orderId, orderNumber, buyerName },
      priority: 'high'
    });
  }

  // Message-related notifications
  static async notifyNewMessage(userId: string, senderName: string, conversationId: string) {
    return this.createNotification({
      userId,
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      type: 'message',
      actionUrl: `/chat?conversation=${conversationId}`,
      data: { conversationId, senderName },
      priority: 'medium'
    });
  }

  // Product-related notifications
  static async notifyProductApproved(supplierId: string, productTitle: string, productId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Product Approved',
      message: `Your product "${productTitle}" has been approved and is now live`,
      type: 'product',
      actionUrl: `/seller/manage-products`,
      data: { productId, productTitle },
      priority: 'medium'
    });
  }

  static async notifyProductRejected(supplierId: string, productTitle: string, reason: string, productId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Product Rejected',
      message: `Your product "${productTitle}" was rejected. Reason: ${reason}`,
      type: 'product',
      actionUrl: `/seller/manage-products`,
      data: { productId, productTitle, reason },
      priority: 'high'
    });
  }

  static async notifyLowStock(supplierId: string, productTitle: string, currentStock: number, productId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Low Stock Alert',
      message: `Your product "${productTitle}" is running low on stock (${currentStock} remaining)`,
      type: 'product',
      actionUrl: `/seller/manage-products`,
      data: { productId, productTitle, currentStock },
      priority: 'medium'
    });
  }

  // Offer-related notifications
  static async notifyNewOffer(buyerId: string, supplierName: string, requestTitle: string, offerId: string) {
    return this.createNotification({
      userId: buyerId,
      title: 'New Offer Received',
      message: `${supplierName} has sent you an offer for "${requestTitle}"`,
      type: 'offer',
      actionUrl: `/requests`,
      data: { offerId, supplierName, requestTitle },
      priority: 'high'
    });
  }

  static async notifyOfferAccepted(supplierId: string, buyerName: string, requestTitle: string, offerId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Offer Accepted',
      message: `${buyerName} has accepted your offer for "${requestTitle}"`,
      type: 'offer',
      actionUrl: `/seller/orders`,
      data: { offerId, buyerName, requestTitle },
      priority: 'high'
    });
  }

  static async notifyOfferRejected(supplierId: string, buyerName: string, requestTitle: string, offerId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Offer Declined',
      message: `${buyerName} has declined your offer for "${requestTitle}"`,
      type: 'offer',
      actionUrl: `/requests`,
      data: { offerId, buyerName, requestTitle },
      priority: 'medium'
    });
  }

  // Request-related notifications
  static async notifyRequestPosted(userId: string, requestTitle: string, requestId: string) {
    return this.createNotification({
      userId,
      title: 'Request Posted Successfully',
      message: `Your request "${requestTitle}" has been posted and suppliers can now send offers`,
      type: 'request',
      actionUrl: `/requests`,
      data: { requestId, requestTitle },
      priority: 'medium'
    });
  }

  // Payment-related notifications
  static async notifyPaymentReceived(supplierId: string, amount: number, orderNumber: string, orderId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'Payment Received',
      message: `You have received payment of PKR ${amount.toLocaleString()} for order ${orderNumber}`,
      type: 'payment',
      actionUrl: `/seller/earnings`,
      data: { orderId, orderNumber, amount },
      priority: 'high'
    });
  }

  static async notifyPaymentFailed(buyerId: string, orderNumber: string, orderId: string) {
    return this.createNotification({
      userId: buyerId,
      title: 'Payment Failed',
      message: `Payment for order ${orderNumber} failed. Please try again or contact support`,
      type: 'payment',
      actionUrl: `/orders`,
      data: { orderId, orderNumber },
      priority: 'high'
    });
  }

  // Review-related notifications
  static async notifyNewReview(supplierId: string, rating: number, productTitle: string, productId: string) {
    return this.createNotification({
      userId: supplierId,
      title: 'New Product Review',
      message: `Your product "${productTitle}" received a ${rating}-star review`,
      type: 'review',
      actionUrl: `/seller/manage-products`,
      data: { productId, productTitle, rating },
      priority: 'medium'
    });
  }

  // System notifications
  static async notifySystemMaintenance(userId: string, maintenanceDate: string, duration: string) {
    return this.createNotification({
      userId,
      title: 'Scheduled Maintenance',
      message: `System maintenance is scheduled for ${maintenanceDate}. Expected duration: ${duration}`,
      type: 'system',
      data: { maintenanceDate, duration },
      priority: 'medium'
    });
  }

  static async notifyAccountVerified(userId: string) {
    return this.createNotification({
      userId,
      title: 'Account Verified',
      message: 'Your account has been successfully verified. You now have access to all features',
      type: 'system',
      actionUrl: `/profile`,
      priority: 'high'
    });
  }

  static async notifyProfileIncomplete(userId: string) {
    return this.createNotification({
      userId,
      title: 'Complete Your Profile',
      message: 'Complete your profile setup to unlock all features and increase your credibility',
      type: 'system',
      actionUrl: `/profile/supplier-setup`,
      priority: 'medium'
    });
  }

  // Bulk notifications
  static async createBulkNotifications(notifications: CreateNotificationParams[]) {
    try {
      await dbConnect();
      
      const notificationDocs = notifications.map(params => ({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        data: params.data || {},
        actionUrl: params.actionUrl,
        priority: params.priority || 'medium',
        isRead: false
      }));

      const result = await Notification.insertMany(notificationDocs);
      return result;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      await dbConnect();
      return await Notification.countDocuments({
        userId,
        isRead: false
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notifications as read
  static async markAsRead(userId: string, notificationIds?: string[]) {
    try {
      await dbConnect();
      
      const query: Record<string, any> = {
        userId,
        isRead: false
      };

      if (notificationIds && notificationIds.length > 0) {
        query._id = { $in: notificationIds };
      }

      const result = await Notification.updateMany(query, {
        isRead: true,
        readAt: new Date()
      });

      return result;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  // Delete old notifications (cleanup task)
  static async deleteOldNotifications(daysOld: number = 30) {
    try {
      await dbConnect();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });

      console.log(`Deleted ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      throw error;
    }
  }
} 