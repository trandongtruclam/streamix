"use client";

import React, { useState } from "react";
import qs from "query-string";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Search() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value) return;

    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: { term: value },
      },
      { skipEmptyString: true }
    );

    router.push(url);
  };

  const onClear = () => setValue("");

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-[400px] flex items-center"
    >
      <div className={cn(
        "flex items-center w-full bg-[#464649] rounded-l-md border-2 transition-all duration-200",
        isFocused ? "border-[#9147ff] bg-[#18181b]" : "border-transparent"
      )}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search"
          className="flex-1 h-9 px-3 bg-transparent text-sm text-white placeholder:text-[#adadb8] focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 mr-1 text-[#adadb8] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        size="sm"
        className="h-9 px-3 rounded-l-none rounded-r-md bg-[#3d3d40] hover:bg-[#4d4d51] border-l border-[#2f2f35] text-[#efeff1]"
      >
        <SearchIcon className="h-5 w-5" />
      </Button>
    </form>
  );
}
