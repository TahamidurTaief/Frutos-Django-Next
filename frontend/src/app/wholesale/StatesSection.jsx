// const stats = [
//   {
//     value: '200+',
//     label: 'Business Partners',
//     sub: 'Restaurants, hotels & retailers',
//     icon: (
//       <svg width="18" height="18" fill="none" stroke="rgba(93,217,168,0.85)" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//         <circle cx="9" cy="7" r="4" />
//         <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//       </svg>
//     ),
//   },
//   {
//     value: '48h',
//     label: 'Max Delivery Window',
//     sub: 'Farm to kitchen, guaranteed',
//     icon: (
//       <svg width="18" height="18" fill="none" stroke="rgba(93,217,168,0.85)" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10" />
//         <polyline points="12 6 12 12 16 14" />
//       </svg>
//     ),
//   },
//   {
//     value: '40+',
//     label: 'Farm Sources',
//     sub: 'Spain & southern Europe',
//     icon: (
//       <svg width="18" height="18" fill="none" stroke="rgba(93,217,168,0.85)" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z" />
//         <path d="M3.82 19.3C4 18 5 13 9 11" />
//       </svg>
//     ),
//   },
//   {
//     value: '99.1%',
//     label: 'On-time Delivery',
//     sub: 'Rolling 12-month average',
//     icon: (
//       <svg width="18" height="18" fill="none" stroke="rgba(93,217,168,0.85)" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//         <polyline points="22 4 12 14.01 9 11.01" />
//       </svg>
//     ),
//   },
// ]

// export default function StatsSection() {
//   return (
//     <>
//       <style>{`
//         .ws-stats-grid {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//         }
//         .ws-stat-cell {
//           padding: 28px 28px;
//           border-left: 1px solid rgba(255,255,255,0.06);
//         }
//         .ws-stat-cell:first-child { border-left: none; }
//         @media (max-width: 768px) {
//           .ws-stats-grid { grid-template-columns: repeat(2, 1fr); }
//           .ws-stat-cell:nth-child(3) { border-left: none; }
//           .ws-stat-cell { padding: 24px 20px; }
//         }
//         @media (max-width: 400px) {
//           .ws-stats-grid { grid-template-columns: repeat(2, 1fr); }
//           .ws-stat-cell { padding: 20px 16px; }
//         }
//       `}</style>

//       <section style={{ background: '#071a10', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
//         <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
//           <div className="ws-stats-grid">
//             {stats.map((s, i) => (
//               <div key={i} className="ws-stat-cell">
//                 <div style={{
//                   width: '32px', height: '32px', borderRadius: '9px',
//                   background: 'rgba(0,105,76,0.22)', border: '1px solid rgba(0,150,100,0.18)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   marginBottom: '12px',
//                 }}>
//                   {s.icon}
//                 </div>
//                 <p style={{
//                   fontFamily: '"Playfair Display", Georgia, serif',
//                   fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700,
//                   color: '#5dd9a8', lineHeight: 1, margin: '0 0 5px',
//                 }}>
//                   {s.value}
//                 </p>
//                 <p style={{ fontSize: '12.5px', color: '#fff', fontWeight: 600, margin: '0 0 2px' }}>{s.label}</p>
//                 <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', margin: 0 }}>{s.sub}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }


// src/app/wholesale/StatsSection.jsx
// Renders the dark stats bar from CMS data.
// `data` is an array of stat objects from the API.

export default function StatsSection({ data = [] }) {
  if (!data.length) return null

  return (
    <>
      <style>{`
        .ws-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .ws-stat-cell {
          padding: 28px 28px;
          border-left: 1px solid rgba(255,255,255,0.06);
        }
        .ws-stat-cell:first-child { border-left: none; }
        @media (max-width: 768px) {
          .ws-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ws-stat-cell:nth-child(3) { border-left: none; }
          .ws-stat-cell { padding: 24px 20px; }
        }
        @media (max-width: 400px) {
          .ws-stat-cell { padding: 20px 16px; }
        }
      `}</style>

      <section style={{
        background: '#071a10',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          <div className="ws-stats-grid">
            {data.map((s) => (
              <div key={s.id} className="ws-stat-cell">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: 'rgba(0,105,76,0.22)',
                  border: '1px solid rgba(0,150,100,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  {/* SVG comes as a raw string from the CMS */}
                  <span
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: s.icon_svg }}
                  />
                </div>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700,
                  color: '#5dd9a8', lineHeight: 1, margin: '0 0 5px',
                }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '12.5px', color: '#fff', fontWeight: 600, margin: '0 0 2px' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', margin: 0 }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}