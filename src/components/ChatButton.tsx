"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiMessageCircle, FiLoader } from 'react-icons/fi';

interface ChatButtonProps {
  receiverId: string;
  receiverName: string;
  receiverType?: 'supplier' | 'buyer';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function ChatButton({ 
  receiverId, 
  receiverName, 
  receiverType = 'supplier',
  className = '',
  size = 'md',
  variant = 'primary'
}: ChatButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  };

  const handleStartConversation = async () => {
    // Check if user is authenticated
    if (status !== 'authenticated') {
      router.push('/signin');
      return;
    }

    // Don't allow starting conversation with yourself
    const currentUserId = (session?.user as { id?: string })?.id;
    if (currentUserId === receiverId) {
      alert("You cannot start a conversation with yourself");
      return;
    }

    try {
      setLoading(true);

      // Start or find existing conversation
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to chat page with the conversation
        router.push(`/chat?conversation=${data.conversation._id}`);
      } else {
        throw new Error(data.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartConversation}
      disabled={loading}
      className={`
        inline-flex items-center space-x-2 font-medium rounded-lg transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <FiLoader className="w-4 h-4 animate-spin" />
      ) : (
        <FiMessageCircle className="w-4 h-4" />
      )}
      <span>
        {loading 
          ? 'Starting...' 
          : `Chat with ${receiverType === 'supplier' ? 'Supplier' : receiverName}`
        }
      </span>
    </button>
  );
} 