import React from "react";

import { getSearch } from "@/lib/search-service";
import { Skeleton } from "@/components/ui/skeleton";

import { ResultCard, ResultCardSkeleton } from "./result-card";

export async function Results({ term }: { term?: string }) {
  const data = await getSearch(term);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl font-bold text-white mb-6">
        Results for &quot;<span className="text-[#bf94ff]">{term}</span>&quot;
      </h2>
      {data.length === 0 && (
        <div className="text-[#adadb8] text-sm bg-[#1f1f23] rounded-lg p-8 text-center">
          <p className="text-lg font-medium mb-2">No results found</p>
          <p>Try searching for something else.</p>
        </div>
      )}
      <div className="flex flex-col gap-y-4">
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
      <div className="flex flex-col gap-y-4">
        {[...Array(4)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
