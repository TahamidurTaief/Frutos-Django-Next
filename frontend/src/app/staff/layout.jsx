"use client";

import { StaffAuthProvider } from "./_context/StaffAuthContext";
import { ToastProvider } from "@/app/dashboard/_components/Toaster";
import StaffAnnouncementListener from "./_components/StaffAnnouncementListener";
import StaffOrderNotificationListener from "./_components/StaffOrderNotificationListener";

export default function StaffLayout({ children }) {
  return (
    <StaffAuthProvider>
      <ToastProvider>
        <StaffAnnouncementListener />
        <StaffOrderNotificationListener />
        {children}
      </ToastProvider>
    </StaffAuthProvider>
  );
}
