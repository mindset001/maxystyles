'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  MessageCircle, Send, Paperclip, Loader2, ChevronLeft,
  CheckCircle, Clock, AlertCircle, ImageIcon, User,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://maxystyles.onrender.com';

interface Attachment { url: string; filename: string; mimetype: string; }
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
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  lastMessageAt: string;
  unreadByAdmin: number;
  messages?: Message[];
}

type FilterStatus = 'all' | 'open' | 'in-progress' | 'closed';

export default function ChatsManagement() {
  const { token } = useAdminAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [fetchError, setFetchError] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Socket.io
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('join-admin', { token });

    socket.on('new-message', ({ chatId, message }: { chatId: string; message: Message }) => {
      if (activeChat?._id === chatId) {
        setMessages(prev => [...prev, message]);
      }
      fetchChats();
    });

    socket.on('chat-updated', () => { fetchChats(); });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeChat && socketRef.current && token) {
      socketRef.current.emit('join-chat', { chatId: activeChat._id, token });
    }
  }, [activeChat, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = useCallback(async () => {
    if (!token) { setFetchError('No admin token — please log in again.'); return; }
    setFetchingList(true);
    setFetchError('');
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`${API_URL}/chat/admin/all${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data.data || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.message || `Error ${res.status}: could not load chats.`);
      }
    } catch (e: any) {
      setFetchError('Network error — is the backend running on port 5000?');
    }
    setFetchingList(false);
  }, [token, filter]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const openChat = async (chat: Chat) => {
    setLoading(true);
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
        setChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadByAdmin: 0 } : c));
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const sendMessage = async () => {
    if ((!text.trim() && files.length === 0) || !activeChat || sending) return;
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
      }
    } catch { /* silent */ }
    setSending(false);
  };

  const updateStatus = async (chatId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/chat/${chatId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, status: status as any } : c));
        if (activeChat?._id === chatId) setActiveChat(prev => prev ? { ...prev, status: status as any } : prev);
      }
    } catch { /* silent */ }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const StatusIcon = ({ s }: { s: string }) => {
    if (s === 'open') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (s === 'in-progress') return <Clock className="w-4 h-4 text-blue-400" />;
    return <CheckCircle className="w-4 h-4 text-gray-400" />;
  };

  const formatTime = (d: string) => new Date(d).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#D4AF37]" /> Customer Chats
        </h2>
        <div className="flex gap-2">
          {(['all', 'open', 'in-progress', 'closed'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 text-xs rounded-full font-medium capitalize transition ${filter === s
                ? 'bg-[#D4AF37] text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chat list */}
        <div className={`flex flex-col gap-2 overflow-y-auto ${view === 'chat' ? 'hidden lg:flex w-80 flex-shrink-0' : 'flex-1 lg:w-80 lg:flex-initial'}`}>
          {fetchingList && (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /></div>
          )}
          {fetchError && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{fetchError}</div>
          )}
          {!fetchingList && !fetchError && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <MessageCircle className="w-12 h-12 opacity-30" />
              <p>No chats found</p>
            </div>
          )}
          {chats.map(chat => (
            <button key={chat._id} onClick={() => openChat(chat)}
              className={`w-full text-left rounded-xl p-3 border transition hover:border-[#D4AF37]/40
                ${activeChat?._id === chat._id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{chat.customerName}</p>
                    {chat.unreadByAdmin > 0 && (
                      <span className="bg-[#D4AF37] text-black text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-bold flex-shrink-0">
                        {chat.unreadByAdmin}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.subject}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <StatusIcon s={chat.status} />
                    <span className="text-xs text-gray-400 capitalize">{chat.status}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Message panel */}
        <div className={`flex-1 flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden min-h-0 ${view === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-3">
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <button onClick={() => { setView('list'); setActiveChat(null); setMessages([]); }}
                  className="lg:hidden text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeChat.customerName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activeChat.customerEmail} · {activeChat.subject}</p>
                </div>
                {/* Status controls */}
                <div className="flex gap-2">
                  {activeChat.status !== 'in-progress' && (
                    <button onClick={() => updateStatus(activeChat._id, 'in-progress')}
                      className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition">
                      Mark Active
                    </button>
                  )}
                  {activeChat.status !== 'closed' && (
                    <button onClick={() => updateStatus(activeChat._id, 'closed')}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition">
                      Close
                    </button>
                  )}
                  {activeChat.status === 'closed' && (
                    <button onClick={() => updateStatus(activeChat._id, 'open')}
                      className="text-xs px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 transition">
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm mt-8">No messages yet.</p>
                ) : messages.map(msg => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm shadow-sm
                        ${isAdmin
                          ? 'bg-[#D4AF37] text-black rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                        }`}>
                        {!isAdmin && <p className="text-[10px] font-bold mb-1 text-[#D4AF37]">{msg.senderName}</p>}
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                        {msg.attachments?.map((att, i) => (
                          att.mimetype?.startsWith('image/') ? (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={att.url} alt={att.filename}
                                className="mt-2 rounded-xl max-w-sm max-h-60 object-cover cursor-pointer hover:opacity-90 transition" />
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

              {/* File preview */}
              {files.length > 0 && (
                <div className="px-4 pt-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      {f.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(f)} alt={f.name}
                          className="w-14 h-14 object-cover rounded-lg border border-[#D4AF37]/40" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-[#D4AF37]/40 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
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

              {/* Input */}
              {activeChat.status !== 'closed' ? (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-end gap-2">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                    onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-[#D4AF37] transition flex-shrink-0 mb-1" title="Attach image">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    rows={1}
                    placeholder="Reply to customer…"
                    className="flex-1 resize-none text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37] text-gray-900 dark:text-white placeholder-gray-400"
                    style={{ maxHeight: '120px', overflowY: 'auto' }}
                  />
                  <button onClick={sendMessage} disabled={sending || (!text.trim() && files.length === 0)}
                    className="text-[#D4AF37] hover:text-[#B8962E] disabled:opacity-40 transition flex-shrink-0 mb-1">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-gray-500">
                  Conversation closed. Reopen to reply.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
