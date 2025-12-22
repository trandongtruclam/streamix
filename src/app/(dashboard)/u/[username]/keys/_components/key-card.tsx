"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CopyButton } from "./copy-button";

export function KeyCard({ value }: { value: string | null }) {
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-xl bg-[#1f1f23] border border-[#2f2f35] p-5">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-[#26262c] rounded-lg flex-shrink-0">
          <Key className="h-5 w-5 text-[#9147ff]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-white text-sm">Stream Key</p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShow(!show)}
              className="h-7 px-2 text-xs text-[#adadb8] hover:text-white"
            >
              {show ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Show
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-x-2">
            <Input
              value={value || ""}
              disabled
              placeholder="Generate a connection to get your stream key"
              type={show ? "text" : "password"}
              className="bg-[#26262c] border-[#35353b] text-[#dedee3] placeholder:text-[#666] font-mono text-sm"
            />
            <CopyButton value={value || ""} />
          </div>
          <p className="text-xs text-[#eb0400] mt-2 flex items-center gap-x-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#eb0400]" />
            Keep your stream key private. Never share it with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
