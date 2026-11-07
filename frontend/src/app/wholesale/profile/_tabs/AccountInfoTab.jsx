'use client'
import { useRef } from 'react'
import { Camera, Building2, Phone, Mail, FileText, MapPin, Briefcase, BarChart } from 'lucide-react'
import StatusBadge from '../_shared/StatusBadge'

export default function AccountInfoTab({ profile, onImageUpload, imageUploading, isInternalWholesale }) {
  const fileInputRef = useRef(null)

  const isInternal = isInternalWholesale !== undefined 
    ? isInternalWholesale 
    : (!profile?.user_type || profile?.user_type === 'WHOLESALER' || profile?.user_type === 'internal' || String(profile?.user_type).toUpperCase() === 'WHOLESALER')

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100">
      <div className="mt-0.5 text-[#085041] bg-[#e8f5e9] p-2.5 rounded-lg shadow-sm">
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[14px] font-semibold text-gray-900 break-words" style={{ wordBreak: 'break-word' }}>{value}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto mt-4 px-2 sm:px-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        
        {/* Header Ribbon (Cover) */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#085041] to-[#0a6c56] relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="px-6 sm:px-10 pb-10 flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center shrink-0 w-full lg:w-64 -mt-16 sm:-mt-20">
            <div 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center relative group cursor-pointer overflow-hidden mb-4 sm:mb-5 transition-transform hover:scale-[1.02]"
              onClick={() => fileInputRef.current?.click()}
            >
              {(profile.profile_image_url || profile.profile_image) ? (
                <img src={profile.profile_image_url || profile.profile_image} alt={profile.contact_name || "Profile"} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-3xl font-bold text-gray-300 uppercase">
                  {(profile.contact_name || profile.business_name || '?')[0]}
                </span>
              )}
              
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white mb-1" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
              </div>
              
              {imageUploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 border-3 border-[#085041] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={onImageUpload} 
            />

            <div className="text-center w-full bg-white lg:bg-transparent rounded-xl p-4 lg:p-0 shadow-sm border border-gray-100 lg:border-none lg:shadow-none">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{profile.contact_name || 'N/A'}</h2>
              <p className="text-[14px] text-gray-500 font-medium mb-4">{profile.business_name || 'N/A'}</p>
              <div className="flex justify-center">
                <StatusBadge status={profile.status} />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 w-full mt-2 lg:mt-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 bg-gray-50/50 rounded-bl-full -z-10"></div>
              
              <h3 className="text-[13px] font-bold text-gray-800 mb-6 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building2 size={16} className="text-[#085041]" />
                Business Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                <InfoField icon={Building2} label="Business Name" value={profile.business_name || 'N/A'} />
                <InfoField icon={Mail} label="Business Email" value={profile.email || 'N/A'} />
                <InfoField icon={Phone} label="Phone Number" value={profile.phone || 'N/A'} />
                <InfoField icon={FileText} label="Trade License" value={profile.trade_license || profile.trade_license_number || 'N/A'} />
                <InfoField icon={Briefcase} label="Business Type" value={profile.display_business_type || profile.business_type || 'N/A'} />
                <InfoField icon={MapPin} label="Delivery Postcode" value={profile.postcode || 'N/A'} />
                
                {!isInternal && (
                  <div className="sm:col-span-2 mt-2">
                    <InfoField 
                      icon={BarChart} 
                      label="Estimated Monthly Volume" 
                      value={
                        profile.monthly_volume ? (
                          profile.monthly_volume === '400_1000' ? '€400 – €1,000 / month' :
                          profile.monthly_volume === '1000_3000' ? '€1,000 – €3,000 / month' :
                          profile.monthly_volume === '3000_7000' ? '€3,000 – €7,000 / month' :
                          profile.monthly_volume === '7000_plus' ? '€7,000+ / month' : profile.monthly_volume
                        ) : 'N/A'
                      } 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
