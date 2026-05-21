// import Image from "next/image";
// import Link from "next/link";

// export default function LeftoverPackBanner() {
//   return (
//     // On mobile this is hidden — WeekendBox.jsx handles the mobile banner
//     <section className="hidden md:block max-w-[1100px] mx-auto px-6 lg:px-10 py-4 pb-14 md:pb-16 bg-[var(--section-color)]">
//       <div
//         className="rounded-2xl overflow-hidden grid md:grid-cols-2 min-h-[300px] md:min-h-[350px]"
//       >
//         {/* ── Text side ── */}
//         <div
//           className="flex flex-col justify-center px-8 md:px-14 py-12 md:py-14"
//           style={{
//             backgroundColor: '#174D3A',
//             backgroundImage: `
//               linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
//             `,
//             backgroundSize: '48px 48px',
//           }}
//         >
//           <h2
//             style={{
//               fontFamily: '"Playfair Display", Georgia, serif',
//               fontSize: 'clamp(1.9rem, 3vw, 2.7rem)',
//               fontWeight: 700,
//               color: '#ffffff',
//               lineHeight: 1.15,
//               marginBottom: '1rem',
//             }}
//           >
//             Leftover Pack&nbsp;—<br />Save food, save&nbsp;money
//           </h2>

//           <p
//             style={{
//               color: 'rgba(255,255,255,0.65)',
//               fontSize: '14px',
//               lineHeight: 1.65,
//               marginBottom: '2rem',
//               maxWidth: '340px',
//             }}
//           >
//             Get a curated selection of seasonal surplus at 40% off.
//             Perfectly good produce that deserves a home.
//           </p>

//           <Link
//             href="/stores"
//             style={{
//               alignSelf: 'flex-start',
//               display: 'inline-block',
//               background: '#9B4F1A',
//               color: '#ffffff',
//               fontWeight: 700,
//               fontSize: '14px',
//               padding: '14px 30px',
//               borderRadius: '8px',
//               textDecoration: 'none',
//               letterSpacing: '0.01em',
//             }}
//           >
//             Get Your Pack
//           </Link>
//         </div>

//         {/* ── Image side ── */}
//         <div className="relative">
//           <Image
//             src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"
//             alt="Fresh produce grocery bag"
//             className="w-full h-full object-cover"
//             width={800} 
//             height={600}
//             priority
//           />
//         </div>
//       </div>
//     </section>
//   )
// }


import Image from "next/image"
import Link from "next/link"

export default function LeftoverPackBanner({ banner }) {
  return (
    // On mobile this is hidden — WeekendBox.jsx handles the mobile banner
    <section className="hidden md:block max-w-[1100px] mx-auto px-6 lg:px-10 py-4 pb-14 md:pb-16 bg-[var(--section-color)]">
      <div className="rounded-2xl overflow-hidden grid md:grid-cols-2 min-h-[300px] md:min-h-[350px]">

        {/* ── Text side ── */}
        <div
          className="flex flex-col justify-center px-8 md:px-14 py-12 md:py-14"
          style={{
            backgroundColor: '#174D3A',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.9rem, 3vw, 2.7rem)',
              fontWeight: 700, color: '#ffffff',
              lineHeight: 1.15, marginBottom: '1rem',
            }}
          >
            {banner.heading}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)', fontSize: '14px',
              lineHeight: 1.65, marginBottom: '2rem', maxWidth: '340px',
            }}
          >
            {banner.description}
          </p>
          <Link
            href={banner.cta_href}
            style={{
              alignSelf: 'flex-start', display: 'inline-block',
              background: '#9B4F1A', color: '#ffffff',
              fontWeight: 700, fontSize: '14px',
              padding: '14px 30px', borderRadius: '8px',
              textDecoration: 'none', letterSpacing: '0.01em',
            }}
          >
            {banner.cta_text}
          </Link>
        </div>

        {/* ── Image side ── */}
        <div className="relative">
          <Image
            src={banner.image_url}
            alt="Fresh produce grocery bag"
            className="w-full h-full object-cover"
            width={800}
            height={600}
            priority
          />
        </div>

      </div>
    </section>
  )
}