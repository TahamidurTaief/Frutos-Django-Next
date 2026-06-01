'use client'
// src/app/providers.jsx
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}


// 'use client'
// import { SessionProvider } from 'next-auth/react'
// import { usePathname } from 'next/navigation'

// export default function Providers({ children, session }) {
//   const pathname = usePathname()
  
//   // Wholesale routes এই SessionProvider দরকার
//   // Profile/shop routes এ দরকার নেই
//   if (pathname?.startsWith('/wholesale')) {
//     return (
//       <SessionProvider session={session}>
//         {children}
//       </SessionProvider>
//     )
//   }
  
//   return <>{children}</>
// }