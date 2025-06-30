import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, Home, MessageSquare, Plus, Trash2, Edit2, Check, Square } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useUserStats';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  isDeletable: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const { user } = useAuth();
  const { incrementStat } = useUserStats();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [lastMessageDate, setLastMessageDate] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (user) {
      loadChatsFromDatabase();
      loadDailyMessageCount();
    }
  }, [user]);

  const loadChatsFromDatabase = async () => {
    if (!user) return;

    try {
      // Load from user_ai_chats table
      const { data: chatData, error } = await supabase
        .from('user_ai_chats')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('last_message_at', { ascending: false });

      if (error) {
        // Show user-friendly popup instead of console.error
        alert('⚠️ Chat History Loading Issue\n\nError loading chat history. Starting with a fresh chat.\n\nYour previous conversations may still be available after refreshing the page.');
        setChats([]);
        setCurrentChatId(null);
        return;
      }

      if (chatData && chatData.length > 0) {
        const loadedChats = chatData.map(chat => ({
          id: chat.id,
          title: chat.chat_title,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          createdAt: new Date(chat.created_at),
          isDeletable: true
        }));
        
        setChats(loadedChats);
        setCurrentChatId(loadedChats[0].id);
      } else {
        setChats([]);
        setCurrentChatId(null);
      }
    } catch (error) {
      // Show user-friendly popup instead of console.error
      alert('💥 Unexpected Error\n\nError loading chat history. Starting with a fresh chat.\n\nPlease try refreshing the page if you need to access previous conversations.');
      setChats([]);
      setCurrentChatId(null);
    }
  };

  const saveChatToDatabase = async (chat: Chat) => {
    if (!user) return;

    try {
      const chatData = {
        id: chat.id,
        user_id: user.id,
        chat_title: chat.title,
        messages: chat.messages,
        message_count: chat.messages.length,
        last_message_at: chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1].timestamp.toISOString()
          : chat.createdAt.toISOString(),
        created_at: chat.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      const { error } = await supabase
        .from('user_ai_chats')
        .upsert(chatData, {
          onConflict: 'id'
        });

      if (error) {
        // Silent fail for chat saving - don't show popup for this
      }
    } catch (error) {
      // Silent fail for chat saving
    }
  };

  const deleteChatFromDatabase = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_ai_chats')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        // Show user-friendly popup instead of console.error
        alert('⚠️ Chat Deletion Issue\n\nError deleting chat. Please try again.\n\nIf the problem persists, refresh the page and try again.');
      }
    } catch (error) {
      // Show user-friendly popup instead of console.error
      alert('💥 Unexpected Error\n\nError deleting chat. Please try again.\n\nIf the problem persists, refresh the page and try again.');
    }
  };

  const loadDailyMessageCount = () => {
    const today = new Date().toDateString();
    const savedCount = localStorage.getItem(`futurepath-daily-messages-${user?.id}`);
    const savedDate = localStorage.getItem(`futurepath-last-message-date-${user?.id}`);

    if (savedDate !== today) {
      setDailyMessageCount(0);
      setLastMessageDate(today);
      localStorage.setItem(`futurepath-daily-messages-${user?.id}`, '0');
      localStorage.setItem(`futurepath-last-message-date-${user?.id}`, today);
    } else {
      setDailyMessageCount(parseInt(savedCount || '0'));
      setLastMessageDate(savedDate || today);
    }
  };

  const createNewChat = async () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your AI career mentor. I'm here to help you explore career paths, develop skills, and plan your future. What would you like to know about your career journey?",
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      isDeletable: true
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    
    // Save to database
    await saveChatToDatabase(newChat);
  };

  const deleteChat = async (chatId: string) => {
    const chatToDelete = chats.find(chat => chat.id === chatId);
    if (!chatToDelete?.isDeletable) return;

    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        setCurrentChatId(null);
      }
    }
    
    // Delete from database
    await deleteChatFromDatabase(chatId);
  };

  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = async () => {
    if (editingChatId && editingTitle.trim()) {
      const updatedChats = chats.map(chat => 
        chat.id === editingChatId ? { ...chat, title: editingTitle.trim() } : chat
      );
      setChats(updatedChats);
      
      // Save updated chat to database
      const updatedChat = updatedChats.find(chat => chat.id === editingChatId);
      if (updatedChat) {
        await saveChatToDatabase(updatedChat);
      }
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const updateChatTitle = async (chatId: string, firstUserMessage: string) => {
    const title = firstUserMessage.length > 30 
      ? firstUserMessage.substring(0, 30) + '...' 
      : firstUserMessage;
    
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    );
    setChats(updatedChats);
    
    // Save updated chat to database
    const updatedChat = updatedChats.find(chat => chat.id === chatId);
    if (updatedChat) {
      await saveChatToDatabase(updatedChat);
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
  };

  const typeMessage = async (message: string) => {
    setStreamingMessage('');
    setIsStreaming(true);
    streamingRef.current = true;
    
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      // Check if streaming was stopped
      if (!streamingRef.current) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    
    setIsStreaming(false);
    streamingRef.current = false;
    return message;
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    streamingRef.current = false;
    setStreamingMessage('');
    setIsLoading(false);
    
    // Clear the input to allow new prompt
    setInputMessage('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (dailyMessageCount >= 5) {
      alert('📝 Daily Limit Reached\n\nYou have reached your daily limit of 5 messages. Please try again tomorrow!\n\nYour limit resets at midnight.');
      return;
    }

    // If no current chat, create one first
    let activeChatId = currentChatId;
    if (!activeChatId) {
      await createNewChat();
      // Wait for state to update and get the newly created chat ID
      const newChatId = chats.length > 0 ? chats[0].id : null;
      if (!newChatId) {
        alert('⚠️ Chat Creation Failed\n\nFailed to create new chat. Please try again.\n\nIf the problem persists, refresh the page.');
        return;
      }
      activeChatId = newChatId;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Update current chat with user message immediately
    setChats(prevChats => prevChats.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    // Update chat title if this is the first user message (after the initial AI message)
    const currentChatForTitle = chats.find(chat => chat.id === activeChatId);
    if (currentChatForTitle) {
      const userMessages = currentChatForTitle.messages.filter(msg => msg.role === 'user');
      const isFirstUserMessage = userMessages.length === 0;
      if (isFirstUserMessage) {
        await updateChatTitle(activeChatId, inputMessage.trim());
      }
    }

    // Increment daily message count and AI messages stat
    const newCount = dailyMessageCount + 1;
    setDailyMessageCount(newCount);
    localStorage.setItem(`futurepath-daily-messages-${user?.id}`, newCount.toString());
    
    // Increment AI messages stat
    incrementStat('messagesWithAI', 1, 'Sent message to AI mentor', 'ai');

    setInputMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Get the updated chat with the user message for context
      const updatedChat = chats.find(chat => chat.id === activeChatId);
      const chatHistory = updatedChat ? [...updatedChat.messages, userMessage] : [userMessage];
      
      const chatHistoryForAPI = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await geminiService.generateResponse(chatHistoryForAPI);
      const typedResponse = await typeMessage(response);

      // Only add the assistant message if streaming completed successfully
      if (streamingRef.current || !isStreaming) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typedResponse,
          timestamp: new Date()
        };

        // Update chats with both user and assistant messages
        setChats(prevChats => prevChats.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, messages: [...chat.messages.filter(m => m.id !== userMessage.id), userMessage, assistantMessage] }
            : chat
        ));
        
        // Save updated chat to database
        const finalChat = chats.find(chat => chat.id === activeChatId);
        if (finalChat) {
          const chatToSave = {
            ...finalChat,
            messages: [...finalChat.messages.filter(m => m.id !== userMessage.id), userMessage, assistantMessage]
          };
          await saveChatToDatabase(chatToSave);
        }
      }

      setStreamingMessage('');
    } catch (error) {
      // Show user-friendly popup instead of console.error
      alert("🤖 AI Response Error\n\nI'm sorry, I'm having trouble responding right now. Please try again in a moment.\n\nThis could be due to:\n• Network connectivity issues\n• AI service temporarily unavailable\n• High server load");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };

      // Update chats with error message
      setChats(prevChats => prevChats.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: [...chat.messages.filter(m => m.id !== userMessage.id), userMessage, errorMessage] }
          : chat
      ));
      
      // Save updated chat to database
      const finalChat = chats.find(chat => chat.id === activeChatId);
      if (finalChat) {
        const chatToSave = {
          ...finalChat,
          messages: [...finalChat.messages.filter(m => m.id !== userMessage.id), userMessage, errorMessage]
        };
        await saveChatToDatabase(chatToSave);
      }
      
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      streamingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewChat}
            className="w-full flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all text-white"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">New Chat</span>
          </button>
          <div className="mt-2 text-center">
            <span className="text-white/70 text-sm">
              Messages today: {dailyMessageCount}/5
            </span>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 ai-chat-sidebar">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                currentChatId === chat.id 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              {editingChatId === chat.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 bg-white/20 text-white text-sm px-2 py-1 rounded border-none outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') saveTitle();
                      if (e.key === 'Escape') cancelEditing();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveTitle();
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-all"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm">{chat.title}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTitle(chat.id, chat.title);
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-all"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    {chat.isDeletable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-white/50 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Click "New Chat" to start</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Career Mentor</h3>
              <p className="text-purple-100 text-sm">Your personalized career guide</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right mr-4">
              <p className="text-sm text-purple-100">Daily Messages</p>
              <p className="font-bold">{dailyMessageCount}/5</p>
            </div>
            <button
              onClick={goToHome}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-full mt-1">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div 
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <User className="h-4 w-4 mt-1 opacity-80" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 max-w-[80%] relative">
                  <div className="flex items-start space-x-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-full mt-1">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div 
                        className="whitespace-pre-wrap leading-relaxed text-gray-800"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessage(streamingMessage) + '<span class="animate-pulse">|</span>'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-2 shadow-lg border border-white/20">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            )}
            
            {/* Show welcome message when no chat is selected */}
            {!currentChatId && chats.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to AI Career Mentor</h3>
                  <p className="text-gray-600 mb-4">Start a new chat to begin exploring your career journey!</p>
                  <button
                    onClick={createNewChat}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Start Your First Chat
                  </button>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-4xl mx-auto flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !currentChatId && chats.length === 0 
                  ? "Start a new chat first..." 
                  : dailyMessageCount >= 5 
                    ? "Daily message limit reached. Try again tomorrow!" 
                    : "Ask me about careers, skills, or your future..."
              }
              className="flex-1 border border-gray-300 rounded-xl p-3 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              rows={2}
              disabled={isLoading || dailyMessageCount >= 5 || (!currentChatId && chats.length === 0)}
            />
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
                title="Stop AI generation permanently"
              >
                <Square className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || dailyMessageCount >= 5 || (!currentChatId && chats.length === 0)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
          {dailyMessageCount >= 5 && (
            <p className="text-center text-red-600 text-sm mt-2">
              You've reached your daily limit of 5 messages. Reset at midnight!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}