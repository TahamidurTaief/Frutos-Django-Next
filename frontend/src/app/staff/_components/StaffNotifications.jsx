"use client";

import { useState } from "react";
import { Bell, Loader2, ChevronDown, Trash2 } from "lucide-react";
import api from "@/app/dashboard/_lib/api";

export default function StaffNotifications({ notifications, mutate, setActiveTab }) {
  const [expandedId, setExpandedId] = useState(null);
  
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "NEW";
    const diffMs = new Date() - new Date(dateString);
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return "JUST NOW";
    if (diffHrs < 24) return `${diffHrs}H AGO`;
    return `${Math.floor(diffHrs/24)}D AGO`;
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/staff/me/notifications/${id}/`);
      mutate(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id)
        };
      }, false);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const toggleAccordion = async (id) => {
    setExpandedId(expandedId === id ? null : id);
    const notification = notifications.find(n => n.id === id);
    if (expandedId !== id && notification && !notification.is_read) {
      try {
        await api.patch(`/api/staff/me/notifications/${id}/`, { is_read: true });
        mutate(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
          };
        }, false);
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  return (
    <div className="mb-12 max-w-4xl">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-serif text-[#004A3A] font-medium tracking-tight">Notifications</h1>
      </div>

      <div className="space-y-3">
        {!notifications ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
            <Loader2 className="w-6 h-6 animate-spin text-[#00694C] mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-[#F1F6EB] flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 opacity-40 text-[#00694C]" />
            </div>
            <p className="text-base font-semibold text-[#004A3A]">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isExpanded = expandedId === n.id;
            
            return (
              <div 
                key={n.id} 
                className={`bg-white rounded-2xl transition-all duration-300 border overflow-hidden ${
                  isExpanded ? 'shadow-md border-[#00694C]/20 ring-1 ring-[#00694C]/5' : 'shadow-sm border-slate-100 hover:border-[#00694C]/30 hover:shadow'
                }`}
              >
                <div 
                  className={`flex items-center justify-between p-4 sm:px-6 cursor-pointer transition-colors duration-300 select-none ${
                    isExpanded ? 'bg-gradient-to-r from-[#F1F6EB]/50 to-white' : 'bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => toggleAccordion(n.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                      isExpanded 
                        ? 'bg-gradient-to-br from-[#00694C] to-[#004A3A] text-white scale-110' 
                        : 'bg-[#E4EFDA] text-[#00694C]'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-[15px] tracking-tight leading-tight transition-colors duration-300 ${
                        isExpanded ? 'text-[#00694C]' : 'text-[#004A3A]'
                      }`}>
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                          {formatTimeAgo(n.created_at)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[11px] font-medium text-slate-400">
                          System Notification
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, n.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isExpanded ? 'bg-[#00694C]/10 text-[#00694C]' : 'text-slate-300 group-hover:text-[#00694C] group-hover:bg-slate-100'
                    }`}>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {/* Animated Accordion Body using CSS Grid */}
                <div 
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 sm:px-6 sm:pb-6">
                       <div className="relative mt-2">
                         {/* Subtle left border accent */}
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00694C]/40 to-transparent rounded-full"></div>
                         <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed pl-5 font-medium">
                           {n.message || n.msg}
                         </p>
                         
                         {n.title?.toLowerCase().includes('task') && setActiveTab && (
                           <div className="pl-5 mt-4">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveTab('MY_SHIFTS');
                               }}
                               className="px-4 py-2 bg-[#00694C] hover:bg-[#004A3A] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
                             >
                               View Tasks History
                             </button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
