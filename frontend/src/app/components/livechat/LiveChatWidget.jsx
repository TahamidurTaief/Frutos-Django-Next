'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Search, Users, Phone, Video, Store, Loader2, Info } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const WS_BASE = API_BASE.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api', '');

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (pathname.startsWith('/dashboard')) {
      const u = localStorage.getItem('admin_user');
      const t = localStorage.getItem('admin_access_token');
      if (u && t) {
        try {
          const parsed = JSON.parse(u);
          parsed.user_type = parsed.userType || parsed.user_type || 'ADMIN';
          setUser(parsed);
          setAccessToken(t);
        } catch { }
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } else if (pathname.startsWith('/staff')) {
      const u = localStorage.getItem('icommerce_staff_user');
      const t = localStorage.getItem('staff_access_token');
      if (u && t) {
        try {
          const parsed = JSON.parse(u);
          parsed.user_type = parsed.userType || parsed.user_type || 'STAFF';
          setUser(parsed);
          setAccessToken(t);
        } catch { }
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } else {
      setUser(null);
      setAccessToken(null);
    }
  }, [pathname]);

  const getAccess = useCallback(() => accessToken, [accessToken]);
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Contact object
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theirTypingStatus, setTheirTypingStatus] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Audio safely
  const playSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//w==');
      audio.play().catch(e => console.log('Audio play prevented', e));
    } catch (e) {
      console.log('Audio error', e);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    const access = getAccess();
    if (!access) return;
    try {
      const res = await fetch(`${API_BASE}/livechat/contacts/`, {
        headers: { 'Authorization': `Bearer ${access}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        const unread = data.reduce((acc, curr) => acc + curr.unread_count, 0);
        setTotalUnread(unread);
      }
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
  }, [getAccess]);

  const fetchHistory = useCallback(async (userId) => {
    const access = getAccess();
    if (!access) return;
    try {
      const res = await fetch(`${API_BASE}/livechat/history/${userId}/`, {
        headers: { 'Authorization': `Bearer ${access}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Refresh contacts to update unread counts
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, [getAccess, fetchContacts]);

  useEffect(() => {
    // Only ADMIN or STAFF can use this
    if (!user || (user.user_type !== 'ADMIN' && user.user_type !== 'STAFF' && !user.is_staff)) {
      return;
    }

    fetchContacts();

    // Connect WebSocket
    const access = getAccess();
    // Add token to protocol or query string. Since django channels AuthMiddlewareStack expects session or token...
    // Actually, simple JWT token might need custom middleware in Channels. 
    // Since we didn't write custom JWT middleware in routing, let's hope session works or we pass token.
    // Assuming simple connection for now. 
    // Wait, simplejwt might need token. Let's pass it in url ?token=
    wsRef.current = new WebSocket(`${WS_BASE}/ws/livechat/?token=${access}`);
    
    wsRef.current.onopen = () => {
      console.log('LiveChat WebSocket Connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.action === 'new_message') {
        const msg = data.message;
        
        // If chat is open with the sender, append message and mark as read
        setActiveChat(prevActive => {
          if (prevActive && prevActive.id === msg.sender_id) {
            setMessages(prev => [...prev, msg]);
            // Send read receipt
            wsRef.current.send(JSON.stringify({
              action: 'mark_read',
              sender_id: msg.sender_id
            }));
            return prevActive;
          } else {
            // Not open, play sound and update contacts unread count
            playSound();
            fetchContacts();
            return prevActive;
          }
        });

      } else if (data.action === 'typing') {
        setActiveChat(prevActive => {
          if (prevActive && prevActive.id === data.sender_id) {
            setTheirTypingStatus(data.is_typing);
          }
          return prevActive;
        });
      } else if (data.action === 'read_receipt') {
        // Mark messages as read in state
        setMessages(prev => prev.map(m => m.receiver_id === data.reader_id ? { ...m, is_read: true } : m));
      }
    };

    wsRef.current.onclose = () => {
      console.log('LiveChat WebSocket Disconnected');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [user, fetchContacts, getAccess, playSound]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, theirTypingStatus]);

  if (!user || (user.user_type !== 'ADMIN' && user.user_type !== 'STAFF' && !user.is_staff)) {
    return null;
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChat) return;

    const text = inputValue.trim();
    
    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: activeChat.id,
      text: text,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputValue('');
    
    wsRef.current.send(JSON.stringify({
      action: 'send_message',
      receiver_id: activeChat.id,
      text: text
    }));
    
    // Stop typing
    wsRef.current.send(JSON.stringify({
      action: 'typing',
      receiver_id: activeChat.id,
      is_typing: false
    }));
  };

  const handleTyping = (e) => {
    setInputValue(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      if (activeChat) {
        wsRef.current.send(JSON.stringify({
          action: 'typing',
          receiver_id: activeChat.id,
          is_typing: true
        }));
      }
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeChat) {
        wsRef.current.send(JSON.stringify({
          action: 'typing',
          receiver_id: activeChat.id,
          is_typing: false
        }));
      }
    }, 2000);
  };

  const openChat = (contact) => {
    setActiveChat(contact);
    fetchHistory(contact.id);
  };

  const uniqueStores = [...new Set(contacts.map(c => c.store_name).filter(Boolean))];

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.store_name && c.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStore = storeFilter ? c.store_name === storeFilter : true;
    return matchesSearch && matchesStore;
  });

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-green-600 to-emerald-400 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
          {!isOpen && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Modal */}
        {isOpen && (
          <div
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[9999] border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-200"
          >
            {!activeChat ? (
              // --- CONTACTS LIST VIEW ---
              <>
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 text-white">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageCircle size={20} />
                    Live Support
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    {user.user_type === 'ADMIN' ? 'Manage staff communications' : 'Chat with Admin'}
                  </p>
                </div>
                
                {user.user_type === 'ADMIN' && (
                  <div className="p-3 border-b border-gray-100 flex flex-col gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search by name or store..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    {uniqueStores.length > 0 && (
                      <select 
                        value={storeFilter}
                        onChange={(e) => setStoreFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">All Stores</option>
                        {uniqueStores.map(store => (
                          <option key={store} value={store}>{store}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                      <Users size={32} className="mb-2 opacity-50" />
                      <p>No contacts found.</p>
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <div 
                        key={contact.id}
                        onClick={() => openChat(contact)}
                        className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors group relative"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{contact.name}</h4>
                          {contact.store_name ? (
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                              <Store size={12} /> {contact.store_name}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 capitalize">{contact.user_type}</p>
                          )}
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {contact.last_message || 'Start a conversation...'}
                          </p>
                        </div>
                        {contact.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              // --- ACTIVE CHAT VIEW ---
              <>
                <div className="bg-white border-b border-gray-100 p-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setActiveChat(null); fetchContacts(); }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                        {activeChat.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-800">{activeChat.name}</h3>
                        {activeChat.store_name && (
                          <p className="text-xs text-emerald-600">{activeChat.store_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] space-y-3 scrollbar-thin scrollbar-thumb-gray-300">
                  {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                          <p style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {theirTypingStatus && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1 w-16">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 bg-white border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputValue}
                      onChange={handleTyping}
                      className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button 
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                    >
                      <Send size={18} className="ml-1" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
    </>
  );
}
