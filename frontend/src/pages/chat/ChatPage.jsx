import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { chatApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/constants';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace('/api/v1', '');
};

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { userId, name, email, role }
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Conversations
  const fetchConversations = async (selectUserId = null) => {
    try {
      const { data } = await chatApi.getConversations();
      const list = data.data.conversations;
      setConversations(list);

      // Handle redirect start chat state from search details
      const startChatWith = location.state?.startChatWith;
      if (startChatWith) {
        const found = list.find((c) => c.userId === startChatWith.userId);
        if (found) {
          setActiveChat(found);
        } else {
          // If no history exists yet, inject a dummy active conversation
          const newChat = {
            userId: startChatWith.userId,
            name: startChatWith.name,
            role: user.role === 'grower' ? 'consumer' : 'grower',
            email: '',
            isNew: true,
          };
          setActiveChat(newChat);
          // Prepend to list temporarily
          setConversations([newChat, ...list]);
        }
        // Clear state history so refresh doesn't force re-opening
        window.history.replaceState({}, document.title);
      } else if (selectUserId) {
        const found = list.find((c) => c.userId === selectUserId);
        if (found) setActiveChat(found);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // 2. Fetch Chat History
  const fetchChatHistory = async (otherUserId) => {
    setLoadingHistory(true);
    try {
      const { data } = await chatApi.getHistory(otherUserId);
      setMessages(data.data.messages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingHistory(false);
    }
  };

  // 3. Connect Socket.io
  useEffect(() => {
    const token = localStorage.getItem('g2c_token');
    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    // Listen for incoming messages
    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // Only append if it belongs to the active chat
        if (activeChat && msg.senderId === activeChat.userId) {
          return [...prev, msg];
        }
        return prev;
      });
      // Refresh list to update previews
      fetchConversations(activeChat?.userId);
    });

    // Listen for sender echo confirmations
    socket.on('message_sent', (msg) => {
      setMessages((prev) => {
        if (activeChat && msg.receiverId === activeChat.userId) {
          return [...prev, msg];
        }
        return prev;
      });
      // Refresh list to update previews
      fetchConversations(activeChat?.userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeChat?.userId]);

  // Load history when active chat changes
  useEffect(() => {
    if (activeChat?.userId) {
      if (activeChat.isNew) {
        setMessages([]);
      } else {
        fetchChatHistory(activeChat.userId);
      }
    }
  }, [activeChat?.userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      receiverId: activeChat.userId,
      text: inputText.trim(),
    });

    setInputText('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
        {/* Left Pane - Inbox List */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/20">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="text-base font-bold text-slate-800">Messages</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your conversations with growers/consumers</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-48">
                <span className="text-3xl mb-2 opacity-40">💬</span>
                <p className="text-xs font-semibold text-slate-500">No conversations yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Select a grower and click "Message Grower".</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => setActiveChat(c)}
                  className={`w-full text-left p-4 flex flex-col transition-colors focus:outline-none ${
                    activeChat?.userId === c.userId ? 'bg-primary-50/40 border-l-4 border-primary-600 pl-3' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex justify-between items-baseline w-full">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{c.name}</span>
                    {c.lastMessageTime && (
                      <span className="text-[9px] text-slate-400">
                        {new Date(c.lastMessageTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-primary-600 font-semibold uppercase mt-0.5">{c.role}</span>
                  {c.lastMessage && (
                    <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessage}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 capitalize">{activeChat.name}</h3>
                  <p className="text-[10px] text-slate-400 capitalize">{activeChat.role} • {activeChat.email || 'New Connection'}</p>
                </div>
              </div>

              {/* Message history */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {loadingHistory ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <span className="text-4xl mb-2">👋</span>
                    <p className="text-sm font-semibold text-slate-700">Say hello!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Start your conversation with {activeChat.name}.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-xs border ${
                            isMe
                              ? 'bg-primary-600 text-white border-primary-600 rounded-br-none'
                              : 'bg-white text-slate-800 border-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <p className={`text-[9px] text-right mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field py-2.5 text-sm flex-1"
                />
                <button type="submit" className="btn-primary py-2 px-6 text-sm font-semibold">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="text-5xl mb-4 opacity-50">💬</span>
              <h3 className="text-base font-bold text-slate-800">Select a Conversation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Pick an existing conversation from the inbox pane, or find a grower and message them directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
