'use client'
import { useState, useRef } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

const inputCls = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e0e8e0',
  borderRadius: '10px', background: '#fafaf8', color: '#151e13',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
}

export default function ProfileTab({ user, authFetch, uploadAvatar, onUserUpdate }) {
  const [form, setForm] = useState({
    firstName:          user?.firstName || '',
    lastName:           user?.lastName  || '',
    phone:              user?.profile?.phone || '',
    bio:                user?.profile?.bio   || '',
    notifOrderUpdates:  user?.profile?.notifOrderUpdates  ?? true,
    notifPromotions:    user?.profile?.notifPromotions    ?? true,
    notifPriceChanges:  user?.profile?.notifPriceChanges  ?? true,
    notifLeftoverPacks: user?.profile?.notifLeftoverPacks ?? true,
  })

  //  Server থেকে আসা avatar আলাদা রাখো
  const serverAvatar = user?.profile?.resolvedAvatar || ''

  //  Local preview URL (blob) — server/AuthContext এর উপর নির্ভর করে না
  const [previewUrl,    setPreviewUrl]    = useState('')
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [passForm,      setPassForm]      = useState({ oldPassword: '', newPassword: '' })
  const [passError,     setPassError]     = useState('')
  const [passSaved,     setPassSaved]     = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarSaved,   setAvatarSaved]   = useState(false)
  const [avatarError,   setAvatarError]   = useState('')
  const fileRef = useRef(null)

  // যে URL দেখাবে: local preview > server avatar
  const displayAvatar = previewUrl || serverAvatar

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return

    //  ফাইল select করার সাথে সাথেই local blob URL দিয়ে preview দেখাও
    const blobUrl = URL.createObjectURL(file)
    setPreviewUrl(blobUrl)

    setAvatarError(''); setAvatarSaved(false); setAvatarLoading(true)
    try {
      await uploadAvatar(file)
      setAvatarSaved(true)
      setTimeout(() => setAvatarSaved(false), 3000)
    } catch {
      setPreviewUrl('')   // error হলে preview সরাও
      setAvatarError('Upload failed. Please try a smaller image.')
    } finally {
      setAvatarLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res  = await authFetch(`${API_BASE}/auth/profile/`, { method: 'PATCH', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error()

      //  server response-এ avatar না থাকলে previewUrl বা serverAvatar preserve করো
      const finalAvatar = data.profile?.resolvedAvatar || previewUrl || serverAvatar || ''
      const merged = {
        ...data,
        profile: { ...data.profile, resolvedAvatar: finalAvatar },
      }
      onUserUpdate(merged)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* ignore */ }
    setSaving(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    setPassError('')
    try {
      const res = await authFetch(`${API_BASE}/auth/change-password/`, { method: 'POST', body: JSON.stringify(passForm) })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.oldPassword?.[0] || d.detail || 'Error')
      }
      setPassSaved(true)
      setPassForm({ oldPassword: '', newPassword: '' })
      setTimeout(() => setPassSaved(false), 3000)
    } catch (err) { setPassError(err.message) }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5 p-6 rounded-2xl" style={{ background: '#f5f9f5', border: '1px solid #e0e8e0' }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: '#ECF7E4', border: '3px solid #00694C20', position: 'relative' }}>
            {/*  displayAvatar ব্যবহার করো — blob URL বা server URL */}
            {displayAvatar
              ? <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl" style={{ color: '#BCCAC1' }}>person</span>
                </div>
            }
            {avatarLoading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                <svg style={{ animation: 'spin 1s linear infinite', width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={avatarLoading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: '#00694C', border: '2px solid white', opacity: avatarLoading ? 0.6 : 1 }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>edit</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-bold text-lg" style={{ color: '#151e13', fontFamily: '"Newsreader",Georgia,serif' }}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm" style={{ color: '#6d7a73' }}>{user?.email}</p>
          {avatarLoading && <p className="text-xs font-medium mt-1.5" style={{ color: '#855000' }}>Uploading photo…</p>}
          {avatarSaved && !avatarLoading && (
            <p className="text-xs font-medium mt-1.5 flex items-center gap-1" style={{ color: '#00694C' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span> Photo updated!
            </p>
          )}
          {avatarError && !avatarLoading && <p className="text-xs font-medium mt-1.5" style={{ color: '#BA1A1A' }}>{avatarError}</p>}
          {!avatarLoading && !avatarSaved && !avatarError && (
            <button onClick={() => fileRef.current?.click()} className="text-xs font-medium mt-1 cursor-pointer"
              style={{ color: '#00694C', background: 'none', border: 'none', padding: 0 }}>
              Change photo
            </button>
          )}
        </div>
      </div>

      {/* Personal info */}
      <form onSubmit={saveProfile} className="p-6 rounded-2xl space-y-4" style={{ background: '#fff', border: '1px solid #eaeaea' }}>
        <h3 className="font-bold text-base" style={{ color: '#151e13' }}>Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>First Name</label>
            <input style={inputCls} value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Jane" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>Last Name</label>
            <input style={inputCls} value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Doe" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>Phone</label>
          <input style={inputCls} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 900077" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>Bio</label>
          <textarea style={{ ...inputCls, height: '80px', resize: 'vertical', paddingTop: '10px' }}
            value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us a little about yourself…" />
        </div>

        <h3 className="font-bold text-base pt-2" style={{ color: '#151e13' }}>Notification Preferences</h3>
        {[
          { key: 'notifOrderUpdates',  label: 'Order updates',        sub: 'Status changes for your orders' },
          { key: 'notifPromotions',    label: 'Promotional offers',   sub: 'Exclusive deals and discounts'  },
          { key: 'notifPriceChanges',  label: 'Price changes',        sub: 'When favourites drop in price'  },
          { key: 'notifLeftoverPacks', label: 'Leftover pack alerts', sub: 'End-of-day fresh packs'         },
        ].map(({ key, label, sub }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer py-2" style={{ borderBottom: '1px solid #f0f4f0' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#151e13' }}>{label}</p>
              <p className="text-xs" style={{ color: '#6d7a73' }}>{sub}</p>
            </div>
            <div onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
              className="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
              style={{ background: form[key] ? '#00694C' : '#BCCAC1' }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: form[key] ? '22px' : '2px' }} />
            </div>
          </label>
        ))}

        <button type="submit" disabled={saving} className="cursor-pointer w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: saved ? '#085041' : '#00694C', marginTop: '8px' }}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="p-6 rounded-2xl space-y-4" style={{ background: '#fff', border: '1px solid #eaeaea' }}>
        <h3 className="font-bold text-base" style={{ color: '#151e13' }}>Change Password</h3>
        {passError && <p className="text-sm p-3 rounded-lg" style={{ background: '#FFF0F0', color: '#BA1A1A' }}>{passError}</p>}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>Current Password</label>
          <input type="password" style={inputCls} value={passForm.oldPassword}
            onChange={e => setPassForm(p => ({ ...p, oldPassword: e.target.value }))} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6d7a73' }}>New Password</label>
          <input type="password" style={inputCls} value={passForm.newPassword}
            onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 8 characters" />
        </div>
        <button type="submit" className="cursor-pointer px-6 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: passSaved ? '#085041' : '#151e13', color: 'white' }}>
          {passSaved ? '✓ Changed!' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}