"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { ClipboardCheck, Loader2, Calendar } from "lucide-react";
import DatePickerModal from "@/app/dashboard/_components/DatePickerModal";

export default function StaffTaskHistoryTab() {
  const [selectedDate, setSelectedDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState({});

  const { data: tasks, isLoading, mutate } = useSWR(
    `/api/staff/me/tasks/${selectedDate ? `?date=${selectedDate}` : ''}`,
    (url) => api.get(url),
    { refreshInterval: 5000 }
  );

  const handleCompleteTask = async (taskId) => {
    try {
      await api.patch(`/api/staff/me/tasks/${taskId}/`, { status: 'COMPLETED', progress_percentage: 100 });
      mutate();
    } catch (err) {
      console.error("Failed to complete task", err);
      alert("Failed to complete task");
    }
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    setSelectedDate("");
  };

  const tasksList = Array.isArray(tasks) ? tasks : (tasks?.results || []);

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-serif text-[#004A3A] font-medium tracking-tight">Task History</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[#004A3A] uppercase tracking-widest mb-1">Filter Tasks</h2>
            <p className="text-xs text-slate-500 font-medium">View your assigned tasks by date</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 relative">
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#00694C] transition-colors" />
                <span className={`text-sm font-medium ${selectedDate ? 'text-[#004A3A]' : 'text-slate-500'}`}>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Filter by Date"}
                </span>
              </div>
              {selectedDate && (
                <div onClick={handleClearDate} className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600">
                  &times;
                </div>
              )}
            </button>
            <DatePickerModal
              isOpen={isDatePickerOpen}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setIsDatePickerOpen(false);
              }}
              onClose={() => setIsDatePickerOpen(false)}
              align="right"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#00694C] mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading your tasks...</p>
        </div>
      ) : tasksList.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-[#F1F6EB] flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 opacity-40 text-[#00694C]" />
          </div>
          <p className="text-lg font-semibold text-[#004A3A] mb-1">No tasks found</p>
          <p className="text-sm text-slate-500 font-medium text-center max-w-sm">
            {selectedDate ? `You have no tasks assigned on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.` : "You don't have any tasks in your history."}
          </p>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate("")}
              className="mt-6 px-5 py-2.5 bg-[#F1F6EB] hover:bg-[#E4EFDA] text-[#00694C] text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              Clear Date Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {tasksList.map((task, i) => (
            <div key={task.id || i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-[#004A3A] leading-tight pr-2">{task.title}</h3>
                  <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                    Assigned: {new Date(task.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                  {task.status === 'COMPLETED' && task.completed_at && (
                    <div className="text-[9px] text-[#009b72] mt-0.5 uppercase tracking-wider font-semibold">
                      Completed: {new Date(task.completed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${task.status === 'COMPLETED' ? 'bg-[#D9EFE5] text-[#00694C]' : task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {task.status?.replace('_', ' ')}
                </span>
              </div>
              
              {task.description && (
                <div className="mb-4 flex-1">
                  <p className={`text-xs text-slate-500 font-medium ${expandedTaskIds[task.id || i] ? '' : 'line-clamp-3'}`}>
                    {task.description}
                  </p>
                  {task.description.length > 120 && (
                    <button
                      onClick={() => setExpandedTaskIds(prev => ({ ...prev, [task.id || i]: !prev[task.id || i] }))}
                      className="text-[10px] font-bold text-[#00694C] hover:opacity-80 mt-1.5 focus:outline-none flex items-center gap-1 cursor-pointer transition-opacity"
                    >
                      {expandedTaskIds[task.id || i] ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}
              
              <div className="mt-auto pt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider">
                  <span>PROGRESS</span>
                  <span className={task.progress_percentage === 100 ? 'text-[#00694C]' : ''}>{task.progress_percentage || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                  <div className={`h-1.5 rounded-full ${task.progress_percentage === 100 ? 'bg-[#009b72]' : 'bg-[#E88C30]'}`} style={{ width: `${task.progress_percentage || 0}%` }}></div>
                </div>
                {task.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="w-full py-2 mt-2 bg-[#00694C] hover:bg-[#004A3A] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
