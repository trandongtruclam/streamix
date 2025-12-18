"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

export function Wrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useCreatorSidebar((state) => state);

  return (
    <aside
      className={cn(
        "z-40 fixed left-0 flex flex-col h-full bg-[#1f1f23] pt-[50px] transition-all duration-300 ease-in-out",
        collapsed ? "w-[50px]" : "w-[50px] lg:w-60"
      )}
    >
      {children}
    </aside>
  );
}
