// const steps = [
//   {
//     num: '1',
//     title: 'Select Your Harvest',
//     desc: 'Choose from our daily updated inventory of organic produce.',
//   },
//   {
//     num: '2',
//     title: 'Carbon-Free Delivery',
//     desc: 'Our electric fleet ensures your groceries arrive fresh and green.',
//   },
//   {
//     num: '3',
//     title: 'Enjoy Local Flavors',
//     desc: 'Direct support to local farmers in every bite.',
//   },
// ]

// // Desktop keeps the original icons
// const desktopIcons = [
//   (
//     <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
//       <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
//     </svg>
//   ),
//   (
//     <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
//       <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
//     </svg>
//   ),
//   (
//     <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
//       <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
//       <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
//     </svg>
//   ),
// ]

// export default function HowItWorks() {
//   return (
//     <section className="py-8 md:py-12" style={{ background: 'transparent' }}>
//       <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

//         {/* Heading */}
//         <div className="text-center mb-8 md:mb-12">
//           <h2
//             style={{
//               fontFamily: '"Playfair Display", Georgia, serif',
//               fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
//               fontWeight: 700,
//               color: '#151E13',
//               marginBottom: '0.75rem',
//             }}
//           >
//             How It Works
//           </h2>
//           <div style={{ width: '40px', height: '3px', background: '#00694C', borderRadius: '9999px', margin: '0 auto' }} />
//         </div>

//         {/* ── MOBILE steps — vertical with number circles ── */}
//         <div className="md:hidden flex flex-col gap-8 max-w-xs mx-auto">
//           {steps.map(({ num, title, desc }) => (
//             <div key={num} className="flex flex-col items-center text-center">
//               {/* Number circle */}
//               <div
//                 className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
//                 style={{
//                   background: 'rgba(180,228,200,0.4)',
//                   border: '1.5px solid #9FD4B8',
//                   color: '#085041',
//                   fontSize: '16px',
//                   fontWeight: 700,
//                 }}
//               >
//                 {num}
//               </div>
//               <h3
//                 style={{
//                   fontFamily: '"Playfair Display", Georgia, serif',
//                   fontSize: '1.05rem',
//                   fontWeight: 600,
//                   color: '#151E13',
//                   marginBottom: '0.5rem',
//                 }}
//               >
//                 {title}
//               </h3>
//               <p
//                 style={{
//                   color: '#4A5E52',
//                   fontSize: '13.5px',
//                   lineHeight: 1.65,
//                 }}
//               >
//                 {desc}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* ── DESKTOP steps — 3-column grid with icons ── */}
//         <div className="hidden md:grid md:grid-cols-3 gap-8 md:gap-12">
//           {steps.map(({ num, title, desc }, i) => (
//             <div
//               key={num}
//               className="flex flex-col items-center text-center"
//               style={{ animationDelay: `${0.15 + i * 0.15}s` }}
//             >
//               <div
//                 className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
//                 style={{
//                   background: 'rgba(180,228,200,0.4)',
//                   border: '1.5px solid #9FD4B8',
//                   color: '#00694C',
//                 }}
//               >
//                 {desktopIcons[i]}
//               </div>
//               <h3
//                 style={{
//                   fontFamily: '"Playfair Display", Georgia, serif',
//                   fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
//                   fontWeight: 600,
//                   color: '#151E13',
//                   marginBottom: '0.75rem',
//                 }}
//               >
//                 {title}
//               </h3>
//               <p
//                 style={{
//                   color: '#4A5E52',
//                   fontSize: '14.5px',
//                   lineHeight: 1.65,
//                   maxWidth: '280px',
//                 }}
//               >
//                 {desc}
//               </p>
//             </div>
//           ))}
//         </div>

//       </div>
//     </section>
//   )
// }


export default function HowItWorks({ heading, steps }) {
  return (
    <section className="py-8 md:py-12" style={{ background: 'transparent' }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
              fontWeight: 700,
              color: '#151E13',
              marginBottom: '0.75rem',
            }}
          >
            {heading}
          </h2>
          <div style={{ width: '40px', height: '3px', background: '#00694C', borderRadius: '9999px', margin: '0 auto' }} />
        </div>

        {/* ── MOBILE steps — vertical number circles ── */}
        <div className="md:hidden flex flex-col gap-8 max-w-xs mx-auto">
          {steps.map(({ id, num, title, desc }) => (
            <div key={id} className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(180,228,200,0.4)',
                  border: '1.5px solid #9FD4B8',
                  color: '#085041',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                {num}
              </div>
              <h3
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '1.05rem', fontWeight: 600,
                  color: '#151E13', marginBottom: '0.5rem',
                }}
              >
                {title}
              </h3>
              <p style={{ color: '#4A5E52', fontSize: '13.5px', lineHeight: 1.65 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── DESKTOP steps — 3-column grid with icons ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map(({ id, num, title, desc, desktopIcon }, i) => (
            <div
              key={id}
              className="flex flex-col items-center text-center"
              style={{ animationDelay: `${0.15 + i * 0.15}s` }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(180,228,200,0.4)', border: '1.5px solid #9FD4B8', color: '#00694C' }}
              >
                {desktopIcon}
              </div>
              <h3
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                  fontWeight: 600, color: '#151E13', marginBottom: '0.75rem',
                }}
              >
                {title}
              </h3>
              <p style={{ color: '#4A5E52', fontSize: '14.5px', lineHeight: 1.65, maxWidth: '280px' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}