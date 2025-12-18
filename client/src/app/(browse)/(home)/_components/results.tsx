import React from "react";

import { getStreams } from "@/lib/feed-service";
import { Skeleton } from "@/components/ui/skeleton";

import { ResultCard, ResultCardSkeleton } from "../result-card";

export async function Results() {
  const data = await getStreams();

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-x-3 mb-6">
        <h2 className="text-xl font-bold text-white">
          Live channels
        </h2>
        <span className="text-sm text-[#adadb8]">
          we think you&apos;ll like
        </span>
      </div>
      {data.length === 0 && (
        <div className="text-[#adadb8] text-sm bg-[#1f1f23] rounded-lg p-8 text-center">
          <p className="text-lg font-medium mb-2">No streams found</p>
          <p>Check back later or follow more channels!</p>
        </div>
      )}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {data.map((result, index) => (
          <div 
            key={result.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ResultCard data={result} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-[290px] mb-6 bg-[#35353b]" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
