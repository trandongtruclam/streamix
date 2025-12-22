"use client";

import React from "react";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

import { useSidebar } from "@/store/use-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hint } from "@/components/hint";

export function Toggle() {
  const { collapsed, onExpand, onCollapse } = useSidebar((state) => state);

  const label = collapsed ? "Expand" : "Collapse";

  return (
    <>
      {collapsed && (
        <div className="hidden lg:flex w-full items-center justify-center py-4">
          <Hint label={label} side="right" asChild>
            <Button 
              variant="ghost" 
              onClick={onExpand} 
              className="h-8 w-8 p-0 text-[#adadb8] hover:text-white hover:bg-[#35353b] rounded-md transition-all duration-200"
            >
              <ArrowRightFromLine className="w-4 h-4" />
            </Button>
          </Hint>
        </div>
      )}
      {!collapsed && (
        <div className="p-3 pl-4 flex items-center w-full border-b border-[#2f2f35]">
          <p className="text-sm font-semibold text-white uppercase tracking-wider">
            For You
          </p>
          <Hint label={label} side="right" asChild>
            <Button
              className="h-7 w-7 p-0 ml-auto text-[#adadb8] hover:text-white hover:bg-[#35353b] rounded-md transition-all duration-200"
              variant="ghost"
              onClick={onCollapse}
            >
              <ArrowLeftFromLine className="w-4 h-4" />
            </Button>
          </Hint>
        </div>
      )}
    </>
  );
}

export function ToggleSkeleton() {
  return (
    <div className="p-3 pl-4 hidden lg:flex items-center justify-between w-full border-b border-[#2f2f35]">
      <Skeleton className="h-5 w-[80px] bg-[#35353b]" />
      <Skeleton className="h-6 w-6 bg-[#35353b]" />
    </div>
  );
}
