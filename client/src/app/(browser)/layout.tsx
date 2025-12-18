import React, { Suspense } from "react";
import { Sidebar, SidebarSkeleton } from "./_components/sidebar";

import { Navbar } from "./_components/navbar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      <Navbar />
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <div className="flex h-full pt-20">{children}</div>
    </div>
  );
}
