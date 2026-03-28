'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, X, Send, Paperclip, Plus, ChevronLeft, Loader2, ImageIcon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://maxystyles.onrender.com';

interface Attachment {
  url: string;
  filename: string;
  mimetype: string;
}

interface Message {
  _id: string;
  sender: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  attachments: Attachment[];
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  lastMessageAt: string;
  unreadByCustomer: number;
  messages?: Message[];
}

export default function ChatWidget() {
  const { user, token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat' | 'new'>('list');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [subject, setSubject] = useState('Design Inquiry');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [error, setError] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchChats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data.data || []);
        const unread = (data.data || []).reduce((acc: number, c: Chat) => acc + (c.unreadByCustomer || 0), 0);
        setTotalUnread(unread);
      }
    } catch { /* silent */ }
  }, [token]);

  // ── Socket.io connection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('new-message', ({ chatId, message }: { chatId: string; message: Message }) => {
      setMessages(prev => {
        // only add if this is the open chat
        const isCurrent = activeChat?._id === chatId;
        return isCurrent ? [...prev, message] : prev;
      });
      setTotalUnread(prev => prev + 1);
      fetchChats();
    });

    socket.on('chat-status-changed', ({ chatId, status }: { chatId: string; status: string }) => {
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, status: status as any } : c));
      if (activeChat?._id === chatId) {
        setActiveChat(prev => prev ? { ...prev, status: status as any } : prev);
      }
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetchChats]);

  // Join socket room when active chat changes
  useEffect(() => {
    if (activeChat && socketRef.current && token) {
      socketRef.current.emit('join-chat', { chatId: activeChat._id, token });
    }
  }, [activeChat, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chats when panel opens
  useEffect(() => {
    if (isOpen) fetchChats();
  }, [isOpen, fetchChats]);

  const openChat = async (chat: Chat) => {
    setLoading(true);
    setError('');
    setActiveChat(chat);
    setView('chat');
    try {
      const res = await fetch(`${API_URL}/chat/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data?.messages || []);
        setActiveChat(data.data);
        setTotalUnread(prev => Math.max(0, prev - (chat.unreadByCustomer || 0)));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Could not load conversation.');
      }
    } catch (e: any) {
      setError('Network error. Is the backend running?');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchChats();
  }, [isOpen, fetchChats]);

  // ── Sending a message ───────────────────────────────────────────────────────
  const sendMessage = async () => {
    if ((!text.trim() && files.length === 0) || !activeChat || sending) return;
    setError('');
    setSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      files.forEach(f => formData.append('attachments', f));

      const res = await fetch(`${API_URL}/chat/${activeChat._id}/message`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.data]);
        setText('');
        setFiles([]);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to send message.');
      }
    } catch {
      setError('Network error. Is the backend running?');
    }
    setSending(false);
  };

  const startNewChat = async () => {
    if (!subject.trim() || sending) return;
    setError('');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });
      if (res.ok) {
        const data = await res.json();
        setChats(prev => [data.data, ...prev]);
        setSubject('Design Inquiry');
        await openChat(data.data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to start chat. Make sure you are logged in.');
      }
    } catch {
      setError('Network error. Is the backend running on port 5000?');
    }
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const statusColor = (s: string) =>
    s === 'open' ? 'text-yellow-500' : s === 'in-progress' ? 'text-blue-400' : 'text-gray-400';

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Only show for logged-in customers (not admins) — guard placed after all hooks
  if (!isAuthenticated || user?.role === 'admin') return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] hover:bg-[#B8962E] text-black rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all duration-300"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-[#D4AF37]/30 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="bg-[#D4AF37] px-4 py-3 flex items-center gap-2">
            {view !== 'list' && (
              <button onClick={() => { setView('list'); setActiveChat(null); setMessages([]); setError(''); }}
                className="text-black hover:opacity-75 mr-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <MessageCircle className="w-5 h-5 text-black" />
            <div className="flex-1">
              <p className="font-bold text-black text-sm">
                {view === 'list' ? 'Design Chats' : view === 'new' ? 'New Conversation' : activeChat?.subject || 'Chat'}
              </p>
              {view === 'chat' && activeChat && (
                <p className={`text-xs ${statusColor(activeChat.status)} capitalize`}>{activeChat.status}</p>
              )}
            </div>
            {view === 'list' && (
              <button onClick={() => { setView('new'); setError(''); }}
                className="text-black hover:opacity-75" title="New chat">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* ── List view ── */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No chats yet</p>
                  <button onClick={() => setView('new')}
                    className="text-sm bg-[#D4AF37] text-black px-4 py-1.5 rounded-full font-medium hover:bg-[#B8962E] transition">
                    Start a chat
                  </button>
                </div>
              ) : chats.map(chat => (
                <button key={chat._id} onClick={() => openChat(chat)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{chat.subject}</p>
                    <p className={`text-xs capitalize mt-0.5 ${statusColor(chat.status)}`}>{chat.status}</p>
                  </div>
                  {chat.unreadByCustomer > 0 && (
                    <span className="bg-[#D4AF37] text-black text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-bold">
                      {chat.unreadByCustomer}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── New chat view ── */}
          {view === 'new' && (
            <div className="flex-1 p-4 flex flex-col gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a conversation and share your design ideas. You can upload images of your designs directly in the chat.
              </p>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Custom Ankara gown design"
                />
              </div>
              <button
                onClick={startNewChat}
                disabled={!subject.trim() || sending}
                className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold py-2 rounded-lg text-sm disabled:opacity-50 transition flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Start Chat
              </button>
            </div>
          )}

          {/* ── Chat view ── */}
          {view === 'chat' && (
            <>
              {error && (
                <div className="px-4 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-center text-gray-400 mt-8">No messages yet. Say hi!</p>
                ) : messages.map(msg => {
                  const isMe = msg.senderRole === 'customer';
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm
                        ${isMe
                          ? 'bg-[#D4AF37] text-black rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                        }`}>
                        {!isMe && <p className="text-[10px] font-bold mb-1 text-[#D4AF37]">{msg.senderName}</p>}
                        {msg.text && <p>{msg.text}</p>}
                        {msg.attachments?.map((att, i) => (
                          att.mimetype?.startsWith('image/') ? (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={att.url} alt={att.filename}
                                className="mt-1 rounded-lg max-w-full max-h-40 object-cover cursor-pointer hover:opacity-90 transition" />
                            </a>
                          ) : (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 mt-1 underline text-xs">
                              <Paperclip className="w-3 h-3" />{att.filename}
                            </a>
                          )
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 px-1">{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Status closed banner */}
              {activeChat?.status === 'closed' && (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-center text-gray-500 border-t border-gray-100 dark:border-gray-800">
                  This conversation is closed.
                </div>
              )}

              {/* File preview */}
              {files.length > 0 && (
                <div className="px-3 pt-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      {f.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(f)} alt={f.name}
                          className="w-12 h-12 object-cover rounded-lg border border-[#D4AF37]/40" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-[#D4AF37]/40 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input area */}
              {activeChat?.status !== 'closed' && (
                <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 flex items-end gap-2">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                    onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-[#D4AF37] transition flex-shrink-0 mb-1" title="Attach design image">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    rows={1}
                    placeholder="Type a message or attach your design…"
                    className="flex-1 resize-none text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37] text-gray-900 dark:text-white placeholder-gray-400"
                    style={{ maxHeight: '100px', overflowY: 'auto' }}
                  />
                  <button onClick={sendMessage} disabled={sending || (!text.trim() && files.length === 0)}
                    className="text-[#D4AF37] hover:text-[#B8962E] disabled:opacity-40 transition flex-shrink-0 mb-1">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
