"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Hint } from "@/components/hint";

export function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}) {
  const { collapsed } = useCreatorSidebar((state) => state);

  const content = (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full h-11 rounded-md transition-all duration-200",
        collapsed ? "justify-center px-2" : "justify-start px-3",
        isActive 
          ? "bg-[#9147ff]/20 text-white hover:bg-[#9147ff]/30" 
          : "text-[#dedee3] hover:bg-[#35353b] hover:text-white"
      )}
    >
      <Link href={href}>
        <div className={cn(
          "flex items-center gap-x-3",
          collapsed && "justify-center"
        )}>
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">{label}</span>}
        </div>
      </Link>
    </Button>
  );

  if (collapsed) {
    return (
      <li>
        <Hint label={label} side="right" asChild>
          {content}
        </Hint>
      </li>
    );
  }

  return <li>{content}</li>;
}

export function NavItemSkeleton() {
  return (
    <li className="flex items-center gap-x-3 px-2 py-2">
      <Skeleton className="h-10 w-10 rounded-md bg-[#35353b]" />
      <div className="flex-1 hidden lg:block">
        <Skeleton className="h-5 w-full bg-[#35353b]" />
      </div>
    </li>
  );
}
