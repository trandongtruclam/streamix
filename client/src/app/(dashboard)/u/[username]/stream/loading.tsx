import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StreamLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 bg-[#26262c] mb-2" />
        <Skeleton className="h-4 w-96 bg-[#26262c]" />
      </div>
      
      <Skeleton className="aspect-video w-full rounded-xl bg-[#26262c] mb-4" />
      
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-full bg-[#26262c]" />
        <Skeleton className="h-12 w-12 rounded-full bg-[#26262c]" />
        <Skeleton className="h-12 w-12 rounded-full bg-[#26262c]" />
      </div>
    </div>
  );
}
