"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the inner map component to disable SSR
const AdminLiveStaffMapInner = dynamic(
  () => import("./AdminLiveStaffMapInner"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm h-[500px]">
        <Loader2 className="w-10 h-10 text-[#00694C] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Live Map...</p>
      </div>
    )
  }
);

export default function AdminLiveStaffMap() {
  return <AdminLiveStaffMapInner />;
}
