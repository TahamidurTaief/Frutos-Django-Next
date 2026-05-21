// const benefits = [
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//         <path d="M9 12l2 2 4-4" />
//       </svg>
//     ),
//     title: 'Guaranteed Freshness',
//     body: 'Every order is harvested within 24 hours of dispatch. Our cold-chain logistics deliver produce at peak quality — every single time.',
//   },
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10" />
//         <polyline points="12 6 12 12 16 14" />
//       </svg>
//     ),
//     title: 'Flexible Ordering Windows',
//     body: 'Order daily, weekly, or on a custom schedule. Cut-off is 10 PM for next-morning delivery across Madrid, Barcelona, and Sevilla.',
//   },
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//         <circle cx="12" cy="7" r="4" />
//         <path d="M16 11l2 2 4-4" />
//       </svg>
//     ),
//     title: 'Dedicated Account Manager',
//     body: 'Every wholesale account gets a named contact who knows your kitchen, your seasonal needs, and is reachable directly — no call centres.',
//   },
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="12" y1="1" x2="12" y2="23" />
//         <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
//       </svg>
//     ),
//     title: 'Transparent Volume Pricing',
//     body: 'Pricing tiers based on monthly volume — the more you order, the better the rate. No hidden surcharges, no seasonal price shocks.',
//   },
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M17 8C8 10 5.9 16.17 3.82 19.3A10 10 0 0 0 19 5c-1-1-2-1.71-2-1.71V8z" />
//         <path d="M3.82 19.3C4 18 5 13 9 11" />
//       </svg>
//     ),
//     title: 'Sustainability Credentials',
//     body: 'All partner farms hold regenerative agriculture certification. Full traceability documentation for menu provenance and ESG reporting.',
//   },
//   {
//     icon: (
//       <svg width="20" height="20" fill="none" stroke="#00694c" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
//         <rect x="1" y="3" width="15" height="13" rx="2" />
//         <path d="M16 8h4l3 3v4h-7V8z" />
//         <circle cx="5.5" cy="18.5" r="2.5" />
//         <circle cx="18.5" cy="18.5" r="2.5" />
//       </svg>
//     ),
//     title: 'Nationwide Cold-Chain Delivery',
//     body: 'Refrigerated fleet covering all major Spanish cities. Temperature-monitored throughout, with live tracking on Growth and Enterprise plans.',
//   },
// ]

// export default function BenefitsSection() {
//   return (
//     <>
//       <style>{`
//         .ws-benefits-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 12px;
//         }
//         .ws-benefit-card {
//           background: #F7FAF8;
//           border-radius: 14px;
//           padding: 22px 20px;
//           border: 1px solid rgba(188,202,193,0.3);
//           transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
//           cursor: default;
//         }
//         .ws-benefit-card:hover {
//           box-shadow: 0 6px 24px rgba(0,105,76,0.07);
//           transform: translateY(-2px);
//           border-color: rgba(0,105,76,0.18);
//         }
//         @media (max-width: 900px) {
//           .ws-benefits-grid { grid-template-columns: repeat(2, 1fr); }
//         }
//         @media (max-width: 560px) {
//           .ws-benefits-grid { grid-template-columns: 1fr; gap: 10px; }
//         }
//       `}</style>

//       <section style={{ background: '#fff', padding: '56px 40px' }}>
//         <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

//           <div style={{ maxWidth: '520px', marginBottom: '40px' }}>
//             <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00694c', display: 'block', marginBottom: '10px' }}>
//               Why partner with us
//             </span>
//             <h2 style={{
//               fontFamily: '"Playfair Display", Georgia, serif',
//               fontWeight: 700, color: '#0d1f14', lineHeight: 1.18,
//               marginBottom: '12px', fontSize: 'clamp(22px, 3vw, 34px)',
//             }}>
//               Everything your operation needs, nothing it doesn't.
//             </h2>
//             {/* <p style={{ fontSize: '14px', color: '#6D7A73', lineHeight: 1.75, margin: 0 }}>
//               We built our wholesale programme by listening to chefs and buyers. Every feature exists because someone asked for it.
//             </p> */}
//           </div>

//           <div className="ws-benefits-grid">
//             {benefits.map((b, i) => (
//               <div key={i} className="ws-benefit-card">
//                 <div style={{
//                   width: '42px', height: '42px', borderRadius: '11px',
//                   background: 'linear-gradient(135deg, #E7F5EB 0%, #D8EEE2 100%)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   marginBottom: '14px', border: '1px solid rgba(0,105,76,0.08)',
//                 }}>
//                   {b.icon}
//                 </div>
//                 <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0d1f14', marginBottom: '7px', lineHeight: 1.35 }}>
//                   {b.title}
//                 </h3>
//                 <p style={{ fontSize: '12.5px', color: '#6D7A73', lineHeight: 1.7, margin: 0 }}>{b.body}</p>
//               </div>
//             ))}
//           </div>

//         </div>
//       </section>
//     </>
//   )
// }


// src/app/wholesale/BenefitsSection.jsx
// Renders the 'Why partner with us' grid from CMS data.
// `data` is an array of benefit objects from the API.

export default function BenefitsSection({ data = [] }) {
  if (!data.length) return null

  return (
    <>
      <style>{`
        .ws-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .ws-benefit-card {
          background: #F7FAF8;
          border-radius: 14px;
          padding: 22px 20px;
          border: 1px solid rgba(188,202,193,0.3);
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
          cursor: default;
        }
        .ws-benefit-card:hover {
          box-shadow: 0 6px 24px rgba(0,105,76,0.07);
          transform: translateY(-2px);
          border-color: rgba(0,105,76,0.18);
        }
        @media (max-width: 900px) {
          .ws-benefits-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .ws-benefits-grid { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <section style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          <div style={{ maxWidth: '520px', marginBottom: '40px' }}>
            <span style={{
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#00694c', display: 'block', marginBottom: '10px',
            }}>
              Why partner with us
            </span>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700, color: '#0d1f14', lineHeight: 1.18,
              marginBottom: '12px', fontSize: 'clamp(22px, 3vw, 34px)',
            }}>
              Everything your operation needs, nothing it doesn't.
            </h2>
          </div>

          <div className="ws-benefits-grid">
            {data.map((b) => (
              <div key={b.id} className="ws-benefit-card">
                <div style={{
                  width: '42px', height: '42px', borderRadius: '11px',
                  background: 'linear-gradient(135deg, #E7F5EB 0%, #D8EEE2 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px', border: '1px solid rgba(0,105,76,0.08)',
                }}>
                  <span
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: b.icon_svg }}
                  />
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0d1f14', marginBottom: '7px', lineHeight: 1.35 }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#6D7A73', lineHeight: 1.7, margin: 0 }}>
                  {b.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}