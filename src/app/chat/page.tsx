"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import Header from "../../components/Header";
import {
  FiSend,
  FiMenu,
  FiSearch,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiPaperclip,
  FiFile,
  FiSmile,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiDownload,
  FiMessageCircle,
  FiRefreshCw
} from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'supplier' | 'admin';
  company?: string;
  avatar?: string;
  verified?: boolean;
}

interface Conversation {
  _id: string;
  conversationType: 'direct' | 'group';
  title: string;
  participants: User[];
  otherParticipant?: User;
  lastMessage?: {
    _id: string;
    content: string;
    messageType: string;
    sender: User;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  lastReadAt?: string;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  receiver: User;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'order' | 'product';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedConversationData, setSelectedConversationData] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data.conversations);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      setError('Error loading conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        scrollToBottom();
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError('Error loading messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSending(true);
      setError("");
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage.trim(),
          messageType: 'text'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage("");
        scrollToBottom();
        
        // Update conversations list
        loadConversations();
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Error sending message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Start new conversation
  const startConversation = async (participantId: string, initialMessage?: string) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          initialMessage,
          conversationType: 'direct'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadConversations();
        setSelectedConversation(data.data._id);
      } else {
        setError('Failed to start conversation');
      }
    } catch (err) {
      setError('Error starting conversation');
      console.error('Error starting conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle conversation selection
  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    const conversation = conversations.find(c => c._id === conversationId);
    setSelectedConversationData(conversation || null);
    
    if (conversationId) {
      await loadMessages(conversationId);
    }
    
    // Close sidebar on mobile
    setSidebarOpen(false);
  };

  // Load conversations on mount
  useEffect(() => {
    if (session?.user) {
      loadConversations();
    }
  }, [session]);

  // Handle URL parameters for direct conversation access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationParam = urlParams.get('conversation');
    const participantParam = urlParams.get('participant');
    
    if (conversationParam && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationParam);
      if (conversation) {
        handleConversationSelect(conversationParam);
      }
    } else if (participantParam && session?.user) {
      // Start new conversation with participant
      startConversation(participantParam);
    }
  }, [conversations, session]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Messages - WholesaleHub</title>
        <meta name="description" content="Chat with suppliers and buyers on WholesaleHub" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex h-full">
              {/* Conversations Sidebar */}
              <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300`}>
                
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={loadConversations}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4" />
          </button>
        </div>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {error && (
                    <div className="p-4 text-center text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  
                  {loading && conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiRefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
                      <p className="text-gray-500 text-sm">Loading conversations...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-gray-400 text-sm mt-1">Start chatting with suppliers and buyers</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation._id}
                          onClick={() => handleConversationSelect(conversation._id)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedConversation === conversation._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {conversation.otherParticipant?.avatar ? (
                                  <Image
                                    src={conversation.otherParticipant.avatar}
                                    alt={conversation.title}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  conversation.title.charAt(0).toUpperCase()
                                )}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                </span>
                              )}
                            </div>

                            {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {conversation.title}
                                </p>
                                {conversation.lastMessage && (
                                  <p className="text-xs text-gray-500">
                                    {formatTime(conversation.lastMessage.createdAt)}
                                  </p>
                                )}
              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 truncate">
                                  {conversation.otherParticipant?.role && (
                                    <span className="capitalize mr-1">
                                      {conversation.otherParticipant.role}
                                    </span>
                                  )}
                                  {conversation.otherParticipant?.company && (
                                    <span className="text-gray-400">• {conversation.otherParticipant.company}</span>
                                  )}
                                </p>
                                {conversation.otherParticipant?.verified && (
                                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
                              
                              {conversation.lastMessage && (
                                <p className="text-xs text-gray-600 truncate mt-1">
                                  {conversation.lastMessage.sender._id === (session.user as any)?.id ? 'You: ' : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
          </div>
        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation && selectedConversationData ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiMenu className="w-5 h-5" />
                          </button>
                          
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {selectedConversationData.otherParticipant?.avatar ? (
                              <Image
                                src={selectedConversationData.otherParticipant.avatar}
                                alt={selectedConversationData.title}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              selectedConversationData.title.charAt(0).toUpperCase()
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{selectedConversationData.title}</h3>
                            <div className="flex items-center space-x-2">
                              {selectedConversationData.otherParticipant?.role && (
                                <span className="text-xs text-gray-500 capitalize">
                                  {selectedConversationData.otherParticipant.role}
                                </span>
                              )}
                              {selectedConversationData.otherParticipant?.verified && (
                                <FiCheckCircle className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FiPhone className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FiVideo className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loading && messages.length === 0 ? (
                        <div className="text-center py-8">
                          <FiRefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
                          <p className="text-gray-500 text-sm">Loading messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                          <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwn = message.sender._id === (session.user as any)?.id;
                          
                          return (
                            <div
                              key={message._id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                isOwn ? 'order-2' : 'order-1'
                              }`}>
                                {!isOwn && (
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                      {message.sender.avatar ? (
                                        <Image
                                          src={message.sender.avatar}
                                          alt={message.sender.name}
                                          width={24}
                                          height={24}
                                          className="rounded-full object-cover"
                                        />
                                      ) : (
                                        message.sender.name.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">
                                      {message.sender.name}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`rounded-2xl px-4 py-2 ${
                                  isOwn 
                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }`}>
                                  {message.messageType === 'text' ? (
                                    <p className="text-sm break-words">{message.content}</p>
                                  ) : (
                                    <div className="text-sm">
                                      <div className="flex items-center space-x-2">
                                        <FiFile className="w-4 h-4" />
                                        <span>{message.fileName}</span>
                                        {message.fileUrl && (
                                          <a 
                                            href={message.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-200 hover:text-white"
                                          >
                                            <FiDownload className="w-4 h-4" />
                                          </a>
                                        )}
                                      </div>
                                      <p className="mt-1">{message.content}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className={`flex items-center mt-1 space-x-1 ${
                                  isOwn ? 'justify-end' : 'justify-start'
                                }`}>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <div className="text-blue-500">
                                      {message.isRead ? (
                                        <FiCheckCircle className="w-3 h-3" />
                                      ) : (
                                        <FiCheck className="w-3 h-3" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
            <div ref={messagesEndRef} />
          </div>

        {/* Message Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiPaperclip className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
          <input
            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <FiSmile className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {sending ? (
                            <FiRefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <FiSend className="w-5 h-5" />
                          )}
          </button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => {
                          // Handle file upload here
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('File selected:', file);
                            // TODO: Implement file upload
                          }
                        }}
                      />
        </form>
                  </>
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <FiMessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Messages</h3>
                      <p className="text-gray-500 mb-6">Select a conversation to start messaging</p>
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Conversations
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  );
} 