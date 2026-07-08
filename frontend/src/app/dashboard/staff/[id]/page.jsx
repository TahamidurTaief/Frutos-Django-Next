"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, ClipboardList, Edit, Ban, MapPin, ChevronLeft, ChevronDown, Store as StoreIcon } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import DatePickerModal from "@/app/dashboard/_components/DatePickerModal";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { useParams, useRouter } from "next/navigation";

export default function StaffDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id;
  const toast = useToastContext();

  // Modals state
  const [activeTab, setActiveTab] = useState("SHIFTS");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [offDayOpen, setOffDayOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [editOffDay, setEditOffDay] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleteShift, setDeleteShift] = useState(null);
  const [deleteOffDay, setDeleteOffDay] = useState(null);
  const [shiftStartDate, setShiftStartDate] = useState("");
  const [shiftEndDate, setShiftEndDate] = useState("");
  const [shiftStoreName, setShiftStoreName] = useState("");
  const [pickerOpenFor, setPickerOpenFor] = useState(null); // "START" or "END"
  const [storeFilterOpen, setStoreFilterOpen] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");

  const { data: staffProfile, isLoading: isStaffLoading } = useSWR(
    staffId ? `/api/staff/admin/employees/${staffId}/` : null,
    (url) => api.get(url)
  );

  const { data: shiftsRaw, mutate: mutateShifts } = useSWR(
    staffId ? `/api/staff/admin/shifts/?staff_id=${staffId}` : null,
    (url) => api.get(url)
  );

  const { data: tasksRaw, mutate: mutateTasks } = useSWR(
    staffId ? `/api/staff/admin/tasks/?staff_id=${staffId}` : null,
    (url) => api.get(url)
  );

  const { data: storesRaw } = useSWR(
    "/api/stores/",
    (url) => api.get(url)
  );

  const allShifts = shiftsRaw?.results || (Array.isArray(shiftsRaw) ? shiftsRaw : []);
  const shifts = allShifts.filter(s => s.status !== 'DAY_OFF');
  const allStoresList = storesRaw?.results || (Array.isArray(storesRaw) ? storesRaw : []);

  const uniqueStores = useMemo(() => {
    const stores = shifts.map(s => s.store_name).filter(Boolean);
    return [...new Set(stores)].sort();
  }, [shifts]);

  const filteredShifts = shifts.filter(s => {
    if (shiftStartDate && s.date < shiftStartDate) return false;
    if (shiftEndDate && s.date > shiftEndDate) return false;
    if (shiftStoreName && s.store_name !== shiftStoreName) return false;
    return true;
  });

  const filteredAttendance = allShifts.filter(s => {
    if (attendanceFilter === "ALL") return true;
    if (attendanceFilter === "ABSENT") return s.status === 'ABSENT';
    if (attendanceFilter === "DAY_OFF") return s.status === 'DAY_OFF';
    if (attendanceFilter === "WORKED") return s.status !== 'ABSENT' && s.status !== 'DAY_OFF';
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const tasks = tasksRaw?.results || (Array.isArray(tasksRaw) ? tasksRaw : []);
  const filteredTasks = tasks.filter(t => taskStatusFilter === "ALL" || t.status === taskStatusFilter);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const handleSaveShift = async (values) => {
    try {
      if (editShift) {
        await api.patch(`/api/staff/admin/shifts/${editShift.id}/`, values);
        toast.success("Shift updated successfully");
      } else {
        await api.post("/api/staff/admin/shifts/", { ...values, staff: staffId });
        toast.success("Shift added successfully");
      }
      setShiftOpen(false);
      setEditShift(null);
      mutateShifts();
    } catch (err) {
      toast.error(err?.message || "Failed to save shift");
    }
  };

  const handleSaveTask = async (values) => {
    try {
      if (editTask) {
        await api.patch(`/api/staff/admin/tasks/${editTask.id}/`, values);
        toast.success("Task updated successfully");
      } else {
        await api.post("/api/staff/admin/tasks/", { ...values, staff: staffId });
        toast.success("Task added successfully");
      }
      setTaskOpen(false);
      setEditTask(null);
      mutateTasks();
    } catch (err) {
      toast.error(err?.message || "Failed to save task");
    }
  };

  const handleSaveOffDay = async (values) => {
    try {
      const payload = { ...values, staff: staffId };
      if (!payload.status) payload.status = 'DAY_OFF';
      if (editOffDay) {
        await api.patch(`/api/staff/admin/shifts/${editOffDay.id}/`, payload);
        toast.success("Record updated");
      } else {
        await api.post("/api/staff/admin/shifts/", payload);
        toast.success("Record added");
      }
      setOffDayOpen(false);
      setEditOffDay(null);
      mutateShifts();
    } catch (err) {
      toast.error(err?.message || "Failed to save record");
    }
  };

  const handleDeleteShift = async () => {
    try {
      await api.delete(`/api/staff/admin/shifts/${deleteShift.id}/`);
      toast.success("Shift deleted");
      setDeleteShift(null);
      mutateShifts();
    } catch (err) {
      toast.error("Failed to delete shift");
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete(`/api/staff/admin/tasks/${deleteTask.id}/`);
      toast.success("Task deleted");
      setDeleteTask(null);
      mutateTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteOffDay = async () => {
    try {
      await api.delete(`/api/staff/admin/shifts/${deleteOffDay.id}/`);
      toast.success("Off Day deleted");
      setDeleteOffDay(null);
      mutateShifts();
    } catch (err) {
      toast.error("Failed to delete off day");
    }
  };

  if (isStaffLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!staffProfile) return <div className="p-8 text-center text-red-500">Staff member not found</div>;

  const shiftFields = [
    { key: "date", label: "Date", required: true, type: "date" },
    { key: "start_time", label: "Start Time", type: "time" },
    { key: "end_time", label: "End Time", type: "time" },
    { key: "break_start", label: "Break Start", type: "time" },
    { key: "break_end", label: "Break End", type: "time" },
    { key: "break_duration_minutes", label: "Break Duration (mins)", type: "number", placeholder: "30" },
    {
      key: "status", label: "Status", type: "select", options: [
        { value: "SCHEDULED", label: "Scheduled" },
        { value: "DAY_OFF", label: "Day Off" },
        { value: "ABSENT", label: "Absent" },
      ]
    },
  ];

  const taskFields = [
    { key: "title", label: "Task Title", required: true, placeholder: "e.g. Package Organic Honey" },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "status", label: "Status", type: "select", options: [
        { value: "PENDING", label: "Pending" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: "Completed" },
      ]
    },
    { key: "progress_percentage", label: "Progress (%)", type: "number", placeholder: "0" },
  ];

  const shiftColumns = [
    { key: "date", label: "Date", render: (v) => <span className="font-medium text-slate-700">{formatDate(v)}</span> },
    {
      key: "time", label: "Time", render: (_, row) => {
        const isPastDate = new Date(row.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        return row.start_time && row.end_time ? (
          <span className="font-medium text-slate-700">{formatTime(row.start_time)} - {formatTime(row.end_time)}</span>
        ) : (row.start_time ? (
          <span className={`font-medium ${isPastDate ? 'text-amber-600' : 'text-blue-600'}`}>{formatTime(row.start_time)} - {isPastDate ? 'Missing Out' : 'In Progress'}</span>
        ) : <span className="text-slate-400">—</span>)
      }
    },
    {
      key: "location", label: "Location", render: (_, row) => row.store_name ? (
        <div className="flex flex-col items-center text-center">
          <span className="font-semibold text-slate-800">{row.store_name}</span>
          {row.store_location && (
            row.store_map_link ? (
              <a href={row.store_map_link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline mt-0.5 flex items-center justify-center gap-1 w-fit transition-colors">
                <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate max-w-[150px]">{row.store_location}</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1 w-fit">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{row.store_location}</span>
              </span>
            )
          )}
        </div>
      ) : <span className="text-slate-400 italic text-xs">Unassigned</span>
    },
    {
      key: "status", label: "Status", render: (v, row) => {
        const isPastDate = new Date(row.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        if (v === 'IN_PROGRESS') {
          if (isPastDate) return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-amber-100 text-amber-700 border border-amber-200">MISSING OUT</span>;
          return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-blue-100 text-blue-700 flex items-center w-fit gap-1.5 border border-blue-200 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>ACTIVE NOW</span>;
        }
        if (v === 'DAY_OFF') return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-slate-100 text-slate-600 border border-slate-200">DAY OFF</span>;
        return <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{v}</span>;
      }
    },
  ];

  const taskColumns = [
    { key: "title", label: "Title" },
    { key: "status", label: "Status", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full ${v === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{v}</span> },
    { key: "progress_percentage", label: "Progress", render: (v) => `${v}%` },
    { key: "created_at", label: "Created", render: (v) => new Date(v).toLocaleDateString() },
  ];

  const offDayFields = [
    { key: "date", label: "Date", required: true, type: "date" },
    {
      key: "status", label: "Status", required: true, type: "select", options: [
        { value: "DAY_OFF", label: "Req. Off (Admin Approved)" },
        { value: "ABSENT", label: "Absent" },
      ]
    },
  ];

  const offDayColumns = [
    { key: "date", label: "Date", align: "left", render: (v) => <span className="font-semibold text-slate-700">{formatDate(v)}</span> },
    {
      key: "time", label: "Time", align: "left", render: (_, row) => {
        const isPastDate = new Date(row.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        return row.start_time && row.end_time ? (
          <span className="font-medium text-slate-700 text-[13px]">{formatTime(row.start_time)} - {formatTime(row.end_time)}</span>
        ) : (row.start_time ? (
          <span className={`font-medium text-[13px] ${isPastDate ? 'text-amber-600' : 'text-blue-600'}`}>{formatTime(row.start_time)} - {isPastDate ? 'Missing Out' : 'In Progress'}</span>
        ) : <span className="text-slate-400">—</span>)
      }
    },
    {
      key: "location", label: "Store", align: "left", render: (_, row) => row.store_name ? (
        <div className="flex flex-col items-start">
          <span className="font-semibold text-slate-800 text-[13px]">{row.store_name}</span>
          {row.store_location && (
            row.store_map_link ? (
              <a href={row.store_map_link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline mt-0.5 flex items-center gap-1 w-fit transition-colors">
                <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate max-w-[150px]">{row.store_location}</span>
              </a>
            ) : (
              <span className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 w-fit">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{row.store_location}</span>
              </span>
            )
          )}
        </div>
      ) : <span className="text-slate-400 italic text-xs">Unassigned</span>
    },
    {
      key: "status", label: "Status", align: "left", render: (v, row) => {
        const isPastDate = new Date(row.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        if (row.status === 'ABSENT') {
          return <span className="inline-flex px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full bg-red-50 text-red-600 border border-red-200 shadow-sm">ABSENT</span>;
        }
        if (row.status === 'DAY_OFF') {
          return <span className="inline-flex px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">REQ. OFF (APPROVED)</span>;
        }
        if (row.status === 'IN_PROGRESS') {
          if (isPastDate) return <span className="inline-flex px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-sm">MISSING OUT</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>WORKED</span>;
      }
    },
  ];

  const activeShift = shifts.find(s => s.status === 'IN_PROGRESS' && new Date(s.date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0));

  return (
    <Container
      title={`Staff: ${staffProfile.user?.name}`}
      description={`${staffProfile.role} • ${staffProfile.store_name || "Unassigned"}`}
      actions={
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 flex items-center gap-2 font-semibold text-sm transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Staff
        </button>
      }
    >

      {/* Active Shift Banner */}
      {activeShift && (
        <div className="mb-6 bg-gradient-to-r from-[#00694C] to-[#004A3A] rounded-xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#009b72]/30 relative overflow-hidden gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
              <MapPin className="w-6 h-6 text-[#BCE4D3]" />
            </div>
            <div>
              <div className="text-[#BCE4D3] text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                CURRENTLY WORKING AT
              </div>
              <h3 className="text-xl font-serif font-bold text-white leading-tight">{activeShift.store_name || "Assigned Store"}</h3>
              {activeShift.store_map_link ? (
                <a href={activeShift.store_map_link} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/70 font-medium mt-0.5 hover:text-white hover:underline transition-colors block w-fit">
                  {activeShift.store_location || "Location not specified"}
                </a>
              ) : (
                <p className="text-[13px] text-white/70 font-medium mt-0.5">{activeShift.store_location || "Location not specified"}</p>
              )}
            </div>
          </div>
          <div className="relative z-10 sm:text-right bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 backdrop-blur-sm w-full sm:w-auto flex sm:block justify-between items-center">
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Checked In</div>
            <div className="text-lg font-bold font-mono text-white">{activeShift.start_time ? formatTime(activeShift.start_time) : "--:--"}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 w-full">
        <button
          onClick={() => setActiveTab("SHIFTS")}
          className={`px-5 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "SHIFTS" ? 'border-[#00694C] text-[#00694C]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Calendar size={16} /> Shifts
        </button>
        <button
          onClick={() => setActiveTab("TASKS")}
          className={`px-5 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "TASKS" ? 'border-[#00694C] text-[#00694C]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <ClipboardList size={16} /> Tasks
        </button>
        <button
          onClick={() => setActiveTab("OFF_DAYS")}
          className={`px-5 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "OFF_DAYS" ? 'border-[#00694C] text-[#00694C]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Ban size={16} /> Attendance & Leaves
        </button>
      </div>

      <div className="w-full">

        {/* Shifts Section */}
        {activeTab === "SHIFTS" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={18} className="text-[#00694C]" /> Shift Schedule</h3>
            </div>
            <div className="p-0">
              <DataTable
                columns={shiftColumns}
                data={filteredShifts}
                searchable={false}
                extraFilters={
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div
                        onClick={() => setStoreFilterOpen(!storeFilterOpen)}
                        className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-[#00694C]/50 transition-colors px-3 py-2 cursor-pointer w-[160px]"
                      >
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className={`text-xs font-medium truncate flex-1 ${shiftStoreName ? 'text-slate-700' : 'text-slate-400'}`}>
                          {shiftStoreName || "All Stores"}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${storeFilterOpen ? 'rotate-180' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {storeFilterOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setStoreFilterOpen(false)}></div>
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden"
                            >
                              <button
                                onClick={() => { setShiftStoreName(""); setStoreFilterOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 ${!shiftStoreName ? 'text-[#00694C] bg-emerald-50/50' : 'text-slate-600'}`}
                              >
                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                                  <MapPin size={12} className="text-slate-400" />
                                </div>
                                All Stores
                              </button>
                              {uniqueStores.map(storeName => {
                                const storeObj = allStoresList.find(s => s.name === storeName);
                                return (
                                  <button
                                    key={storeName}
                                    onClick={() => { setShiftStoreName(storeName); setStoreFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 ${shiftStoreName === storeName ? 'text-[#00694C] bg-emerald-50/50' : 'text-slate-600'}`}
                                  >
                                    <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                                      {storeObj?.image ? (
                                        <img src={storeObj.image} alt={storeName} className="w-full h-full object-cover" />
                                      ) : (
                                        <StoreIcon size={12} className="text-slate-400" />
                                      )}
                                    </div>
                                    {storeName}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative flex items-center">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:border-[#00694C]/50 transition-colors">
                        <div className="px-3 py-2 bg-slate-50 border-r border-slate-200 text-slate-400 flex items-center justify-center">
                          <Calendar size={14} />
                        </div>
                        <button
                          onClick={() => setPickerOpenFor("START")}
                          className={`px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer w-[100px] text-left transition-colors hover:bg-slate-50 ${shiftStartDate ? 'text-slate-700' : 'text-slate-400'}`}
                        >
                          {shiftStartDate ? formatDate(shiftStartDate) : "Start Date"}
                        </button>
                        <span className="text-slate-200 text-xs font-medium px-1">|</span>
                        <button
                          onClick={() => setPickerOpenFor("END")}
                          className={`px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer w-[100px] text-left transition-colors hover:bg-slate-50 ${shiftEndDate ? 'text-slate-700' : 'text-slate-400'}`}
                        >
                          {shiftEndDate ? formatDate(shiftEndDate) : "End Date"}
                        </button>
                      </div>
                      <DatePickerModal
                        isOpen={pickerOpenFor !== null}
                        onClose={() => setPickerOpenFor(null)}
                        selectedDate={pickerOpenFor === "START" ? shiftStartDate : shiftEndDate}
                        onSelectDate={(date) => {
                          if (pickerOpenFor === "START") setShiftStartDate(date);
                          else if (pickerOpenFor === "END") setShiftEndDate(date);
                        }}
                      />
                    </div>
                    {(shiftStartDate || shiftEndDate || shiftStoreName) && (
                      <button onClick={() => { setShiftStartDate(""); setShiftEndDate(""); setShiftStoreName(""); }} className="text-xs text-slate-500 hover:text-red-600 font-medium px-3 py-2 bg-white hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 shadow-sm flex items-center gap-1 cursor-pointer">
                        Clear
                      </button>
                    )}
                  </div>
                }
                actions={(row) => (
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => { setEditShift(row); setShiftOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer" title="Edit">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setDeleteShift(row)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {activeTab === "TASKS" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={18} className="text-[#00694C]" /> Assigned Tasks</h3>
              <button onClick={() => { setEditTask(null); setTaskOpen(true); }} className="text-xs bg-[#00694C] text-white px-3.5 py-1.5 rounded-md hover:bg-[#085041] font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
                <Plus size={14} /> Add Task
              </button>
            </div>
            <div className="p-0">
              <DataTable
                columns={taskColumns}
                data={filteredTasks}
                searchable={true}
                searchKeys={["title"]}
                extraFilters={
                  <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                      <button
                        key={status}
                        onClick={() => setTaskStatusFilter(status)}
                        className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all tracking-wide cursor-pointer ${taskStatusFilter === status
                            ? 'bg-white text-[#00694C] shadow-sm border border-slate-100'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                          }`}
                      >
                        {status === 'ALL' ? 'ALL STATUS' : status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                }
                actions={(row) => (
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => { setEditTask(row); setTaskOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer" title="Edit">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setDeleteTask(row)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {/* Attendance & Leaves Section */}
        {activeTab === "OFF_DAYS" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Ban size={18} className="text-[#00694C]" /> Attendance & Leaves</h3>
              <button onClick={() => { setEditOffDay(null); setOffDayOpen(true); }} className="text-xs bg-[#00694C] text-white px-3.5 py-1.5 rounded-md hover:bg-[#085041] font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
                <Plus size={14} /> Add Record
              </button>
            </div>
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">Filter by:</span>
              {[
                { id: "ALL", label: "All Records" },
                { id: "WORKED", label: "Worked" },
                { id: "ABSENT", label: "Absent" },
                { id: "DAY_OFF", label: "Req. Off (Approved)" },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setAttendanceFilter(filter.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all tracking-wide cursor-pointer border shadow-sm ${attendanceFilter === filter.id
                      ? 'bg-white text-[#00694C] border-slate-200 ring-1 ring-slate-100'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-700'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="p-0">
              <DataTable
                columns={offDayColumns}
                data={filteredAttendance}
                searchable={false}
                actions={(row) => (
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => { setEditOffDay(row); setOffDayOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer" title="Edit">
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setDeleteOffDay(row)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer" title="Delete">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        )}

      </div>

      <Modal open={shiftOpen} onClose={() => { setShiftOpen(false); setEditShift(null); }} title={
        <div className="flex items-center gap-2.5 text-emerald-700">
          <Calendar size={18} className="text-emerald-500" />
          <span>{editShift ? "Edit Shift" : "Add Shift"}</span>
        </div>
      }>
        <FormModal fields={shiftFields} initialValues={editShift || {}} onSubmit={handleSaveShift} submitLabel={editShift ? "Update Shift" : "Save Shift"} />
      </Modal>

      <Modal open={taskOpen} onClose={() => { setTaskOpen(false); setEditTask(null); }} title={
        <div className="flex items-center gap-2.5 text-emerald-700">
          <ClipboardList size={18} className="text-emerald-500" />
          <span>{editTask ? "Edit Task" : "Add Task"}</span>
        </div>
      }>
        <FormModal fields={taskFields} initialValues={editTask || {}} onSubmit={handleSaveTask} submitLabel={editTask ? "Update Task" : "Save Task"} />
      </Modal>

      <Modal open={offDayOpen} onClose={() => { setOffDayOpen(false); setEditOffDay(null); }} title={
        <div className="flex items-center gap-2.5 text-emerald-700">
          <Ban size={18} className="text-emerald-500" />
          <span>{editOffDay ? "Edit Record" : "Add Record"}</span>
        </div>
      }>
        <FormModal fields={offDayFields} initialValues={editOffDay || {}} onSubmit={handleSaveOffDay} submitLabel={editOffDay ? "Update Record" : "Save Record"} />
      </Modal>

      <ConfirmDialog open={!!deleteShift} onClose={() => setDeleteShift(null)} onConfirm={handleDeleteShift} title="Delete Shift" message="Are you sure you want to delete this shift?" />
      <ConfirmDialog open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDeleteTask} title="Delete Task" message="Are you sure you want to delete this task?" />
      <ConfirmDialog open={!!deleteOffDay} onClose={() => setDeleteOffDay(null)} onConfirm={handleDeleteOffDay} title="Delete Record" message="Are you sure you want to delete this attendance record?" />

    </Container>
  );
}
