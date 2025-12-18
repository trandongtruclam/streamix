"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0e0e10]">
      <div className="flex flex-col items-center space-y-6 text-center px-4">
        <div className="p-4 rounded-full bg-[#eb0400]/10 border border-[#eb0400]/20">
          <AlertTriangle className="h-12 w-12 text-[#eb0400]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-[#adadb8] max-w-md">
            We encountered an unexpected error. Please try again later.
          </p>
        </div>
        <Button 
          asChild
          className="bg-[#9147ff] hover:bg-[#772ce8] text-white font-semibold px-6"
        >
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
