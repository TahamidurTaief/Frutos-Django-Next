"use client";

import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { MapPin, Phone, Clock, Store as StoreIcon, CheckCircle2, Navigation, Users, User } from "lucide-react";

export default function StaffStoreInfo({ storeSlug }) {
  const { data, error, isLoading } = useSWR(
    storeSlug ? `/api/fulfillment/stores/slug/${storeSlug}/` : null,
    (url) => api.get(url).then(res => res.data || res)
  );

  const { data: colleagues, isLoading: colleaguesLoading } = useSWR(
    storeSlug ? `/api/staff/me/colleagues/` : null,
    (url) => api.get(url).then(res => res.data || res)
  );

  if (!storeSlug) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <StoreIcon size={48} className="mb-4 opacity-20" />
        <p>No store assigned to your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-500">
        <p>Could not load store information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10">
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-sm">
          {data.image ? (
            <img src={data.image} alt={data.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <StoreIcon size={56} className="text-slate-200" />
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">{data.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-[#00694C]/10 text-[#00694C] font-bold tracking-wider text-xs px-2.5 py-1 rounded-md uppercase">
                Store Code: {data.storeCode || "N/A"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Location</p>
                <p className="text-sm text-slate-600 mt-0.5">{data.fullAddress || data.address}</p>
                <p className="text-xs text-slate-500">{data.city}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Contact</p>
                <p className="text-sm text-slate-600 mt-0.5">{data.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Operating Hours</p>
                <p className="text-sm text-slate-600 mt-0.5">{data.hours || `${data.openTime} - ${data.closeTime}`}</p>
              </div>
            </div>
          </div>
          
          {data.mapLink && (
            <div className="pt-4">
              <a 
                href={data.mapLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00694C] text-white font-bold text-sm rounded-xl hover:bg-[#00523b] transition-colors shadow-sm"
              >
                <Navigation size={16} />
                Get Directions
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
            Features
          </h3>
          {data.features && data.features.length > 0 ? (
            <div className="space-y-4">
              {data.features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-[#00694C]" />
                  <span className="text-slate-700 font-medium capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-slate-500 font-medium">No special features listed.</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-xl text-slate-900 mb-6">Availability</h3>
          {data.availability && data.availability.length > 0 ? (
            <div className="space-y-3">
              {data.availability.map((a, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{a.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${a.available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {a.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No availability data.</p>
          )}
        </div>
      </div>

      {/* Colleagues Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mt-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#00694C]/10 flex items-center justify-center shrink-0">
            <Users size={24} className="text-[#00694C]" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900 leading-tight">Store Colleagues</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">People who work in the same store as you.</p>
          </div>
        </div>

        {colleaguesLoading ? (
          <div className="flex justify-center p-6">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        ) : colleagues && colleagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {colleagues.map((colleague) => (
              <div key={colleague.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#00694C]/20 hover:bg-[#00694C]/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center shadow-sm">
                  {colleague.photo ? (
                    <img src={colleague.photo} alt={colleague.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate leading-snug">
                    {colleague.user.name || colleague.user.email}
                  </h4>
                  <p className="text-xs text-[#00694C] font-bold truncate uppercase tracking-wider mt-0.5">
                    {colleague.role || "Staff"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Users size={40} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No other colleagues found for this store.</p>
          </div>
        )}
      </div>

    </div>
  );
}
