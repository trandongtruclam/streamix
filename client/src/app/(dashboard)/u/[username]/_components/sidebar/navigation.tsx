"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { 
  Fullscreen, 
  KeyRound, 
  MessagesSquare, 
  Users, 
  Radio, 
  BarChart3,
  Video,
  Share2,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";

import { NavItem, NavItemSkeleton } from "./nav-item";

export function Navigation() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading || !user?.username) {
    return (
      <ul className="space-y-1 px-2 pt-4">
        {[...Array(7)].map((_, i) => (
          <NavItemSkeleton key={i} />
        ))}
      </ul>
    );
  }

  const routes = [
    {
      label: "Dashboard",
      href: `/u/${user.username}`,
      icon: Fullscreen,
    },
    {
      label: "Go Live",
      href: `/u/${user.username}/stream`,
      icon: Radio,
    },
    {
      label: "Keys & URLs",
      href: `/u/${user.username}/keys`,
      icon: KeyRound,
    },
    {
      label: "Analytics",
      href: `/u/${user.username}/analytics`,
      icon: BarChart3,
    },
    {
      label: "Chat Settings",
      href: `/u/${user.username}/chat`,
      icon: MessagesSquare,
    },
    {
      label: "Community",
      href: `/u/${user.username}/community`,
      icon: Users,
    },
  ];

  return (
    <ul className="space-y-1 px-2 pt-4">
      {routes.map((route) => (
        <NavItem
          key={route.href}
          {...route}
          isActive={pathname === route.href}
        />
      ))}
    </ul>
  );
}
