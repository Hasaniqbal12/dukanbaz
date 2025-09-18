"use client";

import React from 'react';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface MessagesHoverDropdownProps {
  isVisible: boolean;
  messages?: {
    unreadCount: number;
    recent?: Message[];
  };
}

const MessagesHoverDropdown: React.FC<MessagesHoverDropdownProps> = ({ 
  isVisible, 
  messages 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <span className="text-sm text-gray-500">
            {(messages?.unreadCount && messages.unreadCount > 0) ? `${messages.unreadCount} unread` : 'No unread messages'}
          </span>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {messages?.recent && Array.isArray(messages.recent) && messages.recent.length > 0 ? (
          messages.recent.slice(0, 3).map((message: Message) => (
            <div key={message._id} className="p-3 border-b border-gray-25 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {message.senderName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{message.senderName}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{message.content}</p>
                  {!message.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href="/messages" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center block"
        >
          View All Messages
        </Link>
      </div>
    </div>
  );
};

export default MessagesHoverDropdown;
