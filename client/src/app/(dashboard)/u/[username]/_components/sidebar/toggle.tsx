"use client";

import React from "react";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

export function Toggle() {
  const { collapsed, onCollapse, onExpand } = useCreatorSidebar(
    (state) => state
  );

  const label = collapsed ? "Expand" : "Collapse";

  return (
    <>
      {collapsed && (
        <div className="w-full hidden lg:flex items-center justify-center py-4">
          <Hint label={label} side="right" asChild>
            <Button 
              onClick={onExpand} 
              variant="ghost" 
              className="h-8 w-8 p-0 text-[#adadb8] hover:text-white hover:bg-[#35353b] rounded-md transition-all duration-200"
            >
              <ArrowRightFromLine className="h-4 w-4" />
            </Button>
          </Hint>
        </div>
      )}
      {!collapsed && (
        <div className="p-3 pl-4 hidden lg:flex items-center w-full border-b border-[#2f2f35]">
          <p className="text-sm font-semibold text-white uppercase tracking-wider">
            Dashboard
          </p>
          <Hint label={label} side="right" asChild>
            <Button
              onClick={onCollapse}
              variant="ghost"
              className="h-7 w-7 p-0 ml-auto text-[#adadb8] hover:text-white hover:bg-[#35353b] rounded-md transition-all duration-200"
            >
              <ArrowLeftFromLine className="h-4 w-4" />
            </Button>
          </Hint>
        </div>
      )}
    </>
  );
}
