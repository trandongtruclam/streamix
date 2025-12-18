import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 bg-[#26262c] mb-2" />
        <Skeleton className="h-4 w-96 bg-[#26262c]" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-[#26262c]" />
        ))}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl bg-[#26262c]" />
        <Skeleton className="h-64 rounded-xl bg-[#26262c]" />
      </div>
    </div>
  );
}
